# Phase 2: Active Pose Liveness

## Context Links

- Parent: [plan.md](plan.md)
- Depends on: [phase-01-input-video-sampling.md](phase-01-input-video-sampling.md)

## Overview

**Date:** 2026-06-10
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** P0
**Status:** DONE 2026-06-11 - tests 35/35 passed, reviewed with 0 critical issues
**Review Status:** Pending

Validate FE-guided sequence `center -> left -> right -> center` using real landmarks/head pose.

## Key Insights

- OpenCV/Haar can debug face count but cannot pass production liveness.
- Missing MediaPipe dependency/model must fail closed when `enable_mediapipe=true`.

## Requirements

- Detect exactly one usable face per sampled frame.
- Compute face bbox ratio and ensure face stays inside frame.
- Estimate yaw from MediaPipe landmarks/head pose.
- Split sampled frames into 4 chronological segments.
- Segment pass if >= 50% frames match target pose.
- `valid_face_ratio >= 0.80`.

## Architecture

`ActivePoseValidator` receives sampled frames and returns `pose_score`, `sequence_passed`, `valid_face_ratio`, `multiple_faces_detected`, segment scores, yaw stats, and failure reason.

## Related Code Files

- Modify: `service/ai-kyc-service/app/services/liveness_service.py`
- Modify: `service/ai-kyc-service/app/config.py`
- Modify: `service/ai-kyc-service/requirements.txt` only if compatible runtime is confirmed
- Create or extend: `service/ai-kyc-service/tests/test_liveness_service.py`

## Implementation Steps

1. Add config: face ratio, center yaw, turn yaw.
2. Add lazy MediaPipe loader with clear unavailable reason.
3. Load Face Landmarker model from configured local path.
4. Convert sampled BGR frames to MediaPipe input.
5. Extract face landmarks and yaw.
6. Score segments:
   - center: `abs(yaw) <= 12`
   - left: `yaw <= -18`
   - right: `yaw >= 18`
   - center: `abs(yaw) <= 12`
7. Fail closed for no face, multi-face, out-of-frame, wrong order, missing model.

## Todo List

- [x] MediaPipe loader added.
- [x] Yaw estimator implemented.
- [x] Segment scorer implemented.
- [x] Diagnostics include segment scores and yaw ranges.
- [x] Unit tests cover pass sequence, wrong order, multi-face, low valid-face ratio.

## Success Criteria

- Correct center-left-right-center video passes active pose when MediaPipe/model available.
- Wrong order fails.
- Multiple faces fail.
- Face leaving frame fails.
- Missing MediaPipe/model fails closed with explicit reason.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| MediaPipe unavailable on Python 3.13 | High | High | Recommend Python 3.11/3.12 for liveness; fail closed when unavailable |
| Yaw threshold wrong for FE camera | Medium | Medium | Keep thresholds config-driven and tune with test videos |

## Security Considerations

- Do not allow Haar fallback to produce pass.
- Never expose detailed model internals beyond diagnostics.

## Next Steps

Collect 5-10 real FE videos before threshold tuning.
