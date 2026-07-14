# Debugger Report: KYC Single OCR Call

**Date:** 2026-07-14  
**Scope:** `service/lenshub` KYC/OCR call graph; frontend trigger checked only to explain requests  
**Impact:** incomplete/failed preview can cause second provider OCR attempt, adding cost and latency

## Executive Summary

Root cause confirmed. Normal preview persists OCR, but submit reuses it only when confidence exists and identity number or full name exists. An attempted OCR with missing key fields fails this quality-based predicate, so submit calls `provider.verify(...)`; both FPT and mock `verify(...)` call `verifyOcr(...)` again.

For the intended definition, "one OCR call" means one logical `verifyOcr(front, back)` call per KYC session. Note: FPT implementation sends two outbound IDR HTTP requests inside that one logical call, one per CCCD side. Reducing physical HTTP requests to one is a different provider-contract change and not part of the current low-risk fix.

Minimal fix: make preview mandatory evidence. Submit must reuse any persisted `VerificationResult` showing OCR was attempted, including zero confidence/missing fields; if absent, fail 4xx. Remove the combined `verify(...)` fallback/contract and cover provider invocation counts with processor tests.

## Exact Call Graph

### Canonical UI flow

1. Frontend `use-ekyc-flow.ts:152-161` calls `runOcr()` when leaving document step; `runOcr()` calls `POST /ekyc/ocr-preview` at `:129-150`.
2. `EkycController.java:77-90` calls `KycOcrPreviewService.preview(...)` once.
3. `KycOcrPreviewService.java:43-73` finds/creates a `CREATED` session, calls `provider.verifyOcr(...)` at `:51`, merges and persists `VerificationResult`.
4. Later frontend `use-ekyc-flow.ts:182-201` calls `POST /ekyc/submit`.
5. `EkycController.java:60-74` resolves file assets and calls `IdentityService.submitKyc(...)` once.
6. `IdentityServiceImpl.java:71-107` selects a `CREATED` session and synchronously calls `KycVerificationProcessor.process(...)` at `:91`.
7. `KycVerificationProcessor.java:42-60` loads preview by session ID:
   - reusable predicate true -> reconstruct OCR, call face only (`:47-52`);
   - predicate false -> call combined `provider.verify(request)` (`:53-59`).
8. FPT `verify(...)` calls `verifyOcr(...)` then `verifyFace(...)` (`FptKycProvider.java:49-58`). Mock does same (`MockKycProvider.java:21-30`).
9. Processor always calls liveness once at `KycVerificationProcessor.java:61`, then scores/persists.

### Physical FPT OCR requests

`FptKycProvider.verifyOcr(...)` is one Java invocation but calls `recognizeId(front)` and `recognizeId(back)` at `FptKycProvider.java:71-72`. Each `recognizeId` posts multipart to IDR at `:144-146` and `:232-242`. Therefore:

| Scenario | Logical `verifyOcr` | Outbound FPT IDR HTTP |
| --- | ---: | ---: |
| Complete preview then submit | 1 | 2 |
| Incomplete/failed preview then submit | 2 | 4 |
| Submit without preview | 1 | 2 |
| Each repeated preview request | +1 | +2 |

## Root Cause Evidence

`KycVerificationProcessor.hasOcrPreview(...)` (`:86-90`) requires:

- non-null result;
- non-null confidence;
- identity number **or** full name.

This tests OCR output quality, not whether OCR already ran. `KycOcrPreviewService` still saves attempted results at `:55-73`, including warnings/incomplete fields. Submit then treats that persisted failed attempt as "no preview" and executes hidden OCR fallback at processor `:54`.

The data model already provides a better attempt marker: one `VerificationResult` per session via unique `verification_session_id` (`VerificationResult.java:24-26`), with `ocrProvider`, confidence and raw response fields. No schema change required for the minimal fix.

## Retry, Async, Controller, Concurrency Findings

- Backend provider path synchronous. No `@Async`, `@Retryable`, retry library, or retry loop in identity package. `RestClient` has connect/read timeouts only (`FptKycProvider.java:261-266`).
- Frontend axios can replay a request once after expired E2EE session or access-token 401 (`frontend/src/lib/http.ts:209-250`). Normally those 401s occur before controller/provider execution, so not root cause for duplicate OCR after a successful request.
- Two submit routes exist: canonical `/ekyc/submit` (`EkycController`) and legacy `/identity/ekyc/submit` (`IdentityController.java:42-50`). They are independent endpoints; Spring does not invoke both. Current frontend calls only `/ekyc/submit` (`frontend/src/services/identity.ts:89-96`).
- UI disables Next while OCR busy (`document-capture-step.tsx:121`), reducing normal double-clicks. Backend `/ocr-preview` itself is not idempotent: every request calls provider before checking cached result.
- Preview and submit execute provider network calls inside transactions. Concurrent preview requests can both observe no result and call OCR; unique session-result constraint only detects collision after cost already incurred. Session lookup uses unordered `findByUserId` with no lock (`VerificationSessionRepository.java:14`), so concurrent draft creation/selection is also not protected.
- Provider/parse failure rolls back preview transaction. A user retry then legitimately calls OCR again; exact-once across failed network outcomes needs an explicit attempt state/idempotency policy, beyond the minimal submit-fallback fix.

## Existing Tests

- `FptKycProviderTest` covers face/liveness response parsing only; no OCR HTTP count.
- `KycRiskScoringServiceTest` covers scoring with supplied OCR values only.
- No test for `KycOcrPreviewService`, `KycVerificationProcessor`, `IdentityServiceImpl`, controller call count, duplicate submit, or concurrent preview.
- Diagnostic run: `.\gradlew test --tests "org.web.identity.*"` passed on 2026-07-14 (exit 0, 44.3 s). Passing tests do not exercise the duplicate-call branch.

## Minimal Fix Recommendation

Priority P0:

1. In `KycVerificationProcessor`, require a persisted OCR-attempt result for the selected session. Rehydrate it regardless of confidence/missing fields.
2. If no persisted attempt exists, throw clear `400 BAD_REQUEST` or `409 CONFLICT`; do not call OCR implicitly during submit.
3. Submit calls only `verifyFace(...)` and `verifyLiveness(...)`.
4. Remove unused combined `KycProvider.verify(...)` and both implementations to prevent future hidden OCR orchestration.
5. Add `KycVerificationProcessorTest` verifying:
   - complete preview -> OCR never called on submit; face/liveness once;
   - incomplete/zero-confidence preview -> OCR never called on submit;
   - no preview -> 4xx and zero provider operations.

Priority P1 follow-up if strict once-per-session includes repeated/concurrent preview:

- make `/ocr-preview` idempotent for the same session + front/back asset identity;
- serialize with DB pessimistic/advisory lock or explicit OCR attempt state;
- reject changed assets or create a new session/attempt deliberately;
- add concurrent request test.

## Risks

- Behavior change: legacy/direct clients that submit without preview receive 4xx instead of automatic OCR. Current frontend already previews before submit.
- Reusing failed OCR is correct for call-count guarantee but risk scoring/manual review must tolerate missing fields; current scoring has tests for supplied values, so add incomplete-result processor test.
- Do not claim one outbound FPT request: current IDR API accepts one `image` multipart field, so front/back remain two HTTP requests per one logical OCR operation.

## Unresolved Questions

- Does acceptance mean one logical `verifyOcr(front, back)` per session, or literally one FPT HTTP request? Plan states logical invocation; literal one request needs provider/API contract redesign or front-only OCR.
- Must repeated/concurrent `/ocr-preview` calls also be exactly-once now, or separate idempotency follow-up?

**Status:** DONE  
**Summary:** Duplicate submit OCR root cause proven: quality-based preview predicate falls back to combined provider verification. Minimal fix and regression tests identified; no production code changed.  
**Concerns/Blockers:** Exact-once under concurrent preview and literal one-HTTP-call semantics require explicit product/provider decisions.
