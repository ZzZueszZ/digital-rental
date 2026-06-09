# Phase 1: Backend Liveness Required

## Context Links

- Parent: [plan.md](plan.md)
- Analysis: [reports/analysis-liveness-codebase.md](reports/analysis-liveness-codebase.md)
- Files: `SubmitKycRequest.java`, `KycVerificationProcessor.java`

## Overview

**Date:** 2026-06-08
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Implemented
**Review Status:** Pending

Make liveness mandatory server-side.

## Key Insights

- Frontend currently blocks missing video, but backend DTO allows bypass.
- Provider liveness is only called when URL exists.

## Requirements

- `livenessVideoUrl` required on `POST /ekyc/submit`.
- Backend must always run provider liveness before risk scoring.
- API validation error should be clear.

## Architecture

Client sends front/back/selfie/liveness URLs -> controller validates DTO -> service processes KYC -> processor saves artifacts -> provider verifies face+liveness -> risk saved -> manual review.

## Related Code Files

- Modify: `service/lenshub/src/main/java/org/web/identity/dto/request/SubmitKycRequest.java`
- Modify: `service/lenshub/src/main/java/org/web/identity/service/KycVerificationProcessor.java`
- Test/update if present: `service/lenshub/src/test/java/org/web/identity/**`

## Implementation Steps

1. Add `@NotBlank` to `livenessVideoUrl`.
2. In processor, fail fast or always call `verifyLiveness`.
3. Save `SELFIE_VIDEO` artifact unconditionally after validation.
4. Keep risk scoring behavior.

## Todo List

- [x] DTO validation.
- [x] Processor mandatory liveness.
- [ ] Backend test/compile.

## Success Criteria

- Missing liveness request rejected.
- Existing valid flow still reaches `PENDING_REVIEW`.

## Risk Assessment

- Old clients break: acceptable because requirement says mandatory.
- Provider unavailable: current code returns failed liveness result; admin review still sees risk.

## Security Considerations

- Do not trust client angle completion as anti-spoof proof.
- Keep provider result persisted for admin.

## Next Steps

- Phase 2 guided frontend.
