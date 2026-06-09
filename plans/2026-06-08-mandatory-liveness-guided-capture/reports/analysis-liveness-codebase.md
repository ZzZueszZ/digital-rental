# Analysis Report: Liveness Codebase

**Date:** 2026-06-08

## Current State

- Frontend page: `frontend/src/app/(main)/profile/ekyc/page.tsx`.
- Frontend records one 6s `video/webm`, uploads `/ekyc/upload-liveness-video`, stores URL.
- Frontend submit sends `livenessVideoUrl` optional in type.
- Backend DTO `SubmitKycRequest` has required front/back/selfie, optional liveness.
- `KycVerificationProcessor` calls `provider.verifyLiveness` only when URL present.
- `KycRiskScoringService` adds risk for failed liveness if result exists.
- Session always becomes `PENDING_REVIEW`; admin final approval remains.

## Constraints

- No DB migration needed.
- No new API endpoint needed.
- Existing page is large; keep edits scoped.
- Browser angle validation cannot be trusted for security.

## Proposed Change Surface

- `SubmitKycRequest.java`: add `@NotBlank` for `livenessVideoUrl`.
- `KycVerificationProcessor.java`: remove optional branch for liveness processing or fail fast if blank.
- `frontend/src/services/identity.ts`: make `livenessVideoUrl` required.
- `frontend/src/app/(main)/profile/ekyc/page.tsx`: guided active liveness state machine, Vietnamese UI.
- Docs: update architecture/diagram if implementation accepted.

## Unresolved Questions

- None blocking.
