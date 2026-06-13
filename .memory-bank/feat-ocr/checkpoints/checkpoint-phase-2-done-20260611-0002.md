# Checkpoint: phase-2-done

**Date:** 2026-06-11

## What's Done

- Phase 2 active pose scaffold implemented.
- Added MediaPipe lazy adapter and local Face Landmarker `.task` model path config.
- Added segment scoring for `center -> left -> right -> center`.
- Missing MediaPipe/model paths fail closed with explicit diagnostics.
- `python -m compileall app tests` passed.
- `python -m pytest` passed: 35/35.

## What's Pending

- Phase 3 ONNX passive anti-spoof.
- Phase 4 final score/response/docs polish.
- Phase 5 test set and threshold tuning.

## Exact Next Action

`/code plans/2026-06-10-ai-kyc-liveness-phase-3/plan.md phase-3`

## Key Files

- `service/ai-kyc-service/app/config.py`
- `service/ai-kyc-service/app/services/liveness_pose.py`
- `service/ai-kyc-service/app/services/liveness_service.py`
- `service/ai-kyc-service/tests/test_liveness_service.py`
- `service/ai-kyc-service/README.md`
