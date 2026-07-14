# Code Review Report: KYC Single OCR Call

**Date:** 2026-07-14  
**Scope:** `KycVerificationProcessor`, `KycProvider`, `FptKycProvider`, `MockKycProvider`, `KycVerificationProcessorTest`  
**Verdict:** approved with notes

## Re-review Result

Previous P1 resolved.

`KycVerificationProcessor.java:34-45,100-115` now:

- requires persisted OCR preview;
- loads stored `CCCD_FRONT` and `CCCD_BACK` artifacts;
- requires both storage keys exactly match submitted URLs;
- returns 409 on missing/mismatched artifact;
- checks before artifact overwrite, liveness validation, provider resolution, face match, liveness, risk, or result persistence.

`KycVerificationProcessorTest.java:110-133` covers changed front image and asserts 409, zero provider/risk interactions, and zero artifact saves. This closes evidence-mixing issue reported in first review.

## Remaining Actionable Finding

### [P2] Complete-preview and rehydration matrix still untested

Current tests cover incomplete preview, missing preview, and mismatched images. Plan also names complete preview, zero confidence, provider-name fallback, and stable persisted-field rehydration.

Recommended non-blocking additions:

- complete preview passes exact persisted OCR fields to risk scoring;
- zero confidence/failed `documentValid` remains reusable;
- null `ocrProvider` falls back to active provider name;
- face/liveness explicitly verified `times(1)` and OCR `never()`.

## Compatibility / Call Count

- Java provider API removal has no remaining `verify(SubmitKycRequest)` caller.
- REST request/response shapes unchanged.
- Missing preview and changed preview images intentionally return 409.
- Canonical sequential preview -> submit makes one logical `verifyOcr(...)` call total and zero OCR calls during submit.
- FPT logical OCR still sends two outbound IDR HTTP requests, one per CCCD side.
- Repeated/concurrent `/ocr-preview` remains non-idempotent; strict once-per-session across retries is outside this processor fix.

## Verification

- `./gradlew --no-daemon test --tests org.web.identity.service.KycVerificationProcessorTest`: passed, 2026-07-14.
- Earlier forced rerun timed out without test output; clean no-daemon retry passed.
- Full backend suite not run in this review.

## Unresolved Questions

- Must "one OCR call" include repeated/concurrent preview retries, or only canonical preview -> submit?

**Status:** APPROVED_WITH_NOTES  
**Summary:** P1 fixed; preview artifacts now match submit images before mutation/provider calls. Targeted tests pass.  
**Concerns/Blockers:** no blocker; add P2 coverage matrix when practical. Strict retry/concurrency exact-once remains separate scope.
