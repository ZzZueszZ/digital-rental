# Analysis Report: FPT eKYC Codebase Fit

**Date:** 2026-06-07

## Existing Flow

- Customer KYC UI: `frontend/src/app/(main)/profile/ekyc/page.tsx`.
- API client: `frontend/src/services/identity.ts`.
- Admin review UI: `frontend/src/components/admin/KycManagement.tsx`.
- Customer API: `service/lenshub/src/main/java/org/web/identity/controller/EkycController.java`.
- Admin API: `service/lenshub/src/main/java/org/web/identity/controller/EkycAdminController.java`.
- Business logic: `service/lenshub/src/main/java/org/web/identity/service/impl/IdentityServiceImpl.java`.
- Persistence: `VerificationSession`, `VerificationArtifact`, `VerificationResult`, `FaceVerificationResult`, `RiskAssessment`, `UserIdentity`.

## Current Limitation

- `submitKyc()` currently expects manual identity fields and uses mock AI values.
- All submitted sessions go to `PENDING_REVIEW`.
- Uploads are saved by `FileUploadUtil` under public `/api/uploads`.
- No provider abstraction, no external API config, no timeout/retry policy.
- UI text says auto-reject for `999`, but backend still manual review.

## Fit

The module already has most tables needed for MVP. Best change is replacing mock scoring inside `IdentityServiceImpl` with a provider-oriented service, not rewriting controllers.

## Proposed Data Flow

1. Customer uploads front/back/selfie.
2. Backend stores artifacts.
3. Submit calls `KycVerificationProcessor`.
4. Processor calls `KycProvider` implementation.
5. Normalize OCR into extracted identity fields.
6. Validate required fields, document side/type, expiry, duplicate CCCD, and face match.
7. Save provider results.
8. Compute risk.
9. Set `PENDING_REVIEW` with extracted info and recommendation.
10. Admin approves/rejects.

## High-Risk Files

- `IdentityServiceImpl.java`: split carefully; current file owns session lifecycle and response mapping.
- `FileUploadUtil.java` and static upload serving: privacy risk.
- `KycManagement.tsx`: large UI file; keep changes focused.
- `SubmitKycRequest.java`: must stop requiring manual identity fields.
- `profile/ekyc/page.tsx`: remove personal-info step and redesign status/review around extracted OCR data.
- `application.yml`: add env-driven config only, no secrets.

## Unresolved Questions

- [ ] Use public `/uploads` for MVP demo only, or implement private storage first?
- [ ] Keep duplicate `/identity/ekyc/*` controller routes?
