# Checkpoint: phase-3-done

**Date:** 2026-06-11

## What's Done

- Phase 3 passive anti-spoof ONNX scaffold implemented.
- Added config-owned ONNX model path, input size, bbox expand ratio, live class index.
- Added CPU-only ONNX Runtime session creation.
- Added face crop preprocessing and percentile-25 score aggregation.
- Anti-spoof missing/unavailable/failing paths fail closed when enabled.
- `python -m compileall app tests` passed.
- `python -m pytest` passed: 38/38.

## What's Pending

- Phase 4 score/response/docs polish.
- Phase 5 test set and threshold tuning.
- Exact ONNX model/license/preprocessing pinning.

## Exact Next Action

`/code plans/2026-06-10-ai-kyc-liveness-phase-3/plan.md phase-4`

## Key Files

- `service/ai-kyc-service/app/services/liveness_antispoof.py`
- `service/ai-kyc-service/app/services/liveness_service.py`
- `service/ai-kyc-service/app/services/liveness_pose.py`
- `service/ai-kyc-service/app/config.py`
- `service/ai-kyc-service/tests/test_liveness_service.py`
