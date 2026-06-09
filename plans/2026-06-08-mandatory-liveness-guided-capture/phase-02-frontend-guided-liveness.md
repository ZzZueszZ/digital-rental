# Phase 2: Frontend Guided Liveness UX

## Context Links

- Parent: [plan.md](plan.md)
- Research: [research/researcher-guided-liveness-ux.md](research/researcher-guided-liveness-ux.md)
- File: `frontend/src/app/(main)/profile/ekyc/page.tsx`

## Overview

**Date:** 2026-06-08
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Implemented
**Review Status:** Pending

Replace current liveness text/record button with Vietnamese guided active liveness capture.

## Key Insights

- Must be direct and visual.
- Use current camera/MediaRecorder code to avoid new dependency.
- Client validation is quality gate, not final security.

## Requirements

- Text in Vietnamese.
- Show prompt list and current action.
- Validate each angle before next.
- Block continue until video uploaded.
- User can retry.

## Architecture

React state machine:

`idle -> camera-ready -> recording -> step-validating -> completed -> uploading -> uploaded`

Prompt list:

1. Nhìn thẳng vào khung hình.
2. Quay mặt sang trái.
3. Quay mặt sang phải.
4. Nhìn thẳng lại và giữ yên.

Validation MVP:

- Camera stream active.
- Minimum time per prompt.
- Video frame non-zero.
- User explicitly completes prompt or timed auto-pass with clear UI.
- Optional later: add face landmark package for real yaw/pitch estimate.

## Related Code Files

- Modify: `frontend/src/app/(main)/profile/ekyc/page.tsx`
- Modify: `frontend/src/services/identity.ts`

## Implementation Steps

1. Add prompt metadata: id, title, instruction, visual cue.
2. Add state: `livenessStepIndex`, `livenessStepStatus`, `livenessProgress`, `livenessChecklist`.
3. Start recording and advance prompts sequentially.
4. Disable advance until prompt duration/quality condition passes.
5. Upload one final video after all prompts pass.
6. Replace English text with Vietnamese labels/toasts.
7. Make service request type require `livenessVideoUrl`.

## Todo List

- [x] Guided prompt state.
- [x] Visual progress/checklist.
- [x] Vietnamese copy.
- [x] Retry flow.
- [ ] Frontend lint/build.

## Success Criteria

- User sees Vietnamese step-by-step face angle guide.
- Cannot continue if any prompt incomplete.
- Submit payload always includes liveness URL.
- UI remains responsive mobile/desktop.

## Risk Assessment

- False confidence from client validation: mitigate with copy + provider final decision.
- Long page file grows: keep scoped, no unrelated refactor.
- MediaRecorder support variance: keep existing fallback.

## Security Considerations

- Do not show provider liveness score to customer.
- Do not claim client angle validation proves real person.

## Next Steps

- Phase 3 verification and docs.
