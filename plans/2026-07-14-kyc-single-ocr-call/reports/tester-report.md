# Test Results Report

**Date:** 2026-07-14
**Scope:** `service/lenshub` KYC single-OCR regression

## Result

- Status: PASS
- Targeted: 3/3 passed
- Full backend: 51/51 passed across 19 suites
- Failed/errors/skipped: 0/0/0
- Full XML test time: 9.076s; Gradle wall time: 42s
- Coverage: not collected; no coverage task configured for this validation

## Commands

```powershell
.\gradlew.bat test --tests org.web.identity.service.KycVerificationProcessorTest --no-daemon
.\gradlew.bat test --no-daemon
```

## Regression Verification

- `processReusesIncompletePreviewWithoutCallingOcrAgain`: passed. Explicit `verify(provider, never()).verifyOcr(...)`; persisted incomplete preview reused; face and liveness each verified once.
- `processFailsBeforeProviderCallsWhenPreviewIsMissing`: passed. Throws `ApplicationException` with HTTP 409 and required-preview message.
- Missing preview fails immediately after result lookup. Test verifies no interactions with provider registry, provider, artifact repository, or risk scorer; therefore no provider or persistence workflow starts.
- `processRejectsSubmitWhenIdentityImagesDifferFromPreview`: passed. Front/back artifacts bind submit to preview images; mismatch returns HTTP 409 before provider/risk calls and verifies artifact save never occurs.
- Repository search: production `verifyOcr(...)` call exists only in `KycOcrPreviewService`; submit processor has no OCR call or combined `verify(...)` fallback.

## Build Status

- Compile/test compilation: PASS
- Full Gradle test task: PASS
- Warnings: benign JVM class-data-sharing warning only
- Critical issues: none

## Recommendation

- Accept fix for stated scope. Separate follow-up only if concurrent/retried `/ocr-preview` requests must also be server-idempotent.

## Unresolved Questions

- Does "one attempt" include concurrent/retried `/ocr-preview` requests, beyond submit avoiding OCR retry?
