# Code Review Summary: Phase 2 Active Pose Liveness

**Date:** 2026-06-10

## Scope

- Files reviewed:
  - `service/ai-kyc-service/app/config.py`
  - `service/ai-kyc-service/app/services/liveness_pose.py`
  - `service/ai-kyc-service/app/services/liveness_service.py`
  - `service/ai-kyc-service/tests/test_liveness_service.py`
  - `service/ai-kyc-service/README.md`

## Overall Assessment

Phase 2 implementation is acceptable for CPU-only active pose with optional MediaPipe runtime. The scorer is testable without model files, and the request path fails closed when MediaPipe/model is missing or invalid.

## Critical Issues

- None.

## High Priority Findings

- None.

## Medium Priority Improvements

- Runtime MediaPipe validation still needs a real `face_landmarker.task` and FE videos.
- Yaw estimator is a lightweight landmark-ratio estimator. Tune thresholds with real videos before trusting auto-pass.

## Contract Notes

- `data` response keys remain Java-compatible.
- Diagnostics are outside `data`.
- Haar/OpenCV fallback cannot pass liveness.

## Security Notes

- Model path comes only from env/config, not request.
- Missing/unavailable/invalid model paths fail closed.
- No raw video frame data is returned in diagnostics.

## Unresolved Questions

- [ ] Confirm production Python version for MediaPipe.
- [ ] Provide Face Landmarker `.task` model path.
- [ ] Provide FE liveness videos for threshold tuning.
