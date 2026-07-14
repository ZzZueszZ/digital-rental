# Implementation Plan: KYC Single OCR Call

**Date:** 2026-07-14
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** Low
**Estimated Effort:** 2-4 hours

## Overview

Make `POST /ekyc/ocr-preview` the only OCR execution point for a KYC session. Final submit must reuse the persisted preview, including incomplete/failed OCR, then run face match, liveness, risk scoring, and manual-review handoff without a second OCR provider call.

## Root-Cause Hypothesis

- Preview already calls `provider.verifyOcr(...)` and persists `VerificationResult`.
- Submit considers preview reusable only when confidence plus identity number/full name exist.
- Incomplete/failed OCR is persisted but fails `hasOcrPreview(...)`; submit falls back to `provider.verify(request)`, whose FPT/mock implementations call OCR again.
- No processor test asserts provider interaction counts, so duplicate billing/latency can regress unnoticed.

## Target Data Flow

1. Initiate one `CREATED` verification session.
2. OCR preview calls provider once for front/back pair and persists result, even when fields are missing.
3. Submit loads that session result as proof OCR was attempted; never calls OCR again.
4. Submit calls face match and liveness once, scores persisted OCR, saves results, moves session to `PENDING_REVIEW`.
5. Missing persisted preview fails fast with a clear 4xx response; client must run preview, not trigger hidden OCR.

## Affected Files / Ownership

- Modify `service/lenshub/src/main/java/org/web/identity/service/KycVerificationProcessor.java`: remove fallback OCR; require/reuse persisted preview.
- Modify `service/lenshub/src/main/java/org/web/identity/service/provider/KycProvider.java`: remove combined `verify(...)` orchestration if unused.
- Modify `service/lenshub/src/main/java/org/web/identity/service/provider/FptKycProvider.java`: remove combined method.
- Modify `service/lenshub/src/main/java/org/web/identity/service/provider/MockKycProvider.java`: remove combined method.
- Create `service/lenshub/src/test/java/org/web/identity/service/KycVerificationProcessorTest.java`: interaction-count/regression coverage.
- No database, endpoint shape, frontend, or provider URL changes planned.

## Implementation TODOs

- [x] Replace field-quality-based `hasOcrPreview` branching with required persisted-result reuse.
- [x] Rehydrate `KycOcrResult` from persisted values; preserve zero confidence/missing fields as failed evidence, not reason to retry OCR.
- [x] Throw existing `ApplicationException` with `CONFLICT` when submit has no preview.
- [x] Require submitted front/back artifacts to match preview artifacts; reject mismatch with `409 CONFLICT` before provider or persistence work.
- [x] Call only `verifyFace(...)` and `verifyLiveness(...)` during submit.
- [x] Remove unused combined `verify(...)` contract/implementations and imports.
- [x] Add three regression tests for incomplete preview reuse, missing preview, and artifact mismatch; targeted and full backend suites pass.

## Test Strategy

- Unit: persisted complete preview -> `verifyOcr`/combined verify never called; face/liveness each once.
- Unit: persisted incomplete/failed preview -> no OCR retry; risk path receives persisted missing fields.
- Unit: no preview -> clear 4xx; no OCR, face, liveness, or persistence side effects.
- Unit: provider name fallback and zero confidence remain stable.
- Regression: `./gradlew test --tests org.web.identity.service.KycVerificationProcessorTest`.
- Full: `./gradlew test` from `service/lenshub`.

## Failure Modes and Mitigation

| Failure | Likelihood / Impact | Mitigation |
| --- | --- | --- |
| Client submits without preview | Medium / Medium | Fail fast; preserve explicit preview-first contract. |
| OCR returned no key fields | Medium / High | Reuse failed evidence; manual-review risk remains high; never bill twice. |
| Preview belongs to another active session | Low / High | Reuse only result keyed by submit session; existing initiate flow cancels prior active sessions. |
| Duplicate `/ocr-preview` HTTP requests | Low / Medium | Existing UI busy state prevents normal double-click; server idempotency is follow-up if retries are observed. |
| Provider API interface change breaks callers | Low / Low | Confirm repository-wide search before removal; keep split methods unchanged. |

## Compatibility and Rollback

- External REST requests/responses unchanged; stored sessions/results remain readable; no migration.
- Behavior change: submit without OCR preview returns 4xx instead of silently running OCR.
- Rollback: revert processor/provider interface edits and the new test; no data rollback required.

## Success Criteria

- One normal initiate -> preview -> submit attempt records exactly one `verifyOcr` invocation.
- Submit performs zero OCR invocations for both successful and incomplete persisted previews.
- Missing-preview submit is deterministic and does not contact any provider operation.
- Targeted and full backend tests pass.

## Unresolved Questions

- Does “one attempt” also require server-side idempotency for concurrent/retried `/ocr-preview` requests? If yes, add a session lock/idempotency marker as a separate medium-complexity follow-up.
