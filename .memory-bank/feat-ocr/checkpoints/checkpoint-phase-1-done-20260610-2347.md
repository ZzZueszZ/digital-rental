# Checkpoint: phase-1-done

**Date:** 2026-06-10

## What's Done

- Phase 1 input/video sampling implemented.
- Liveness endpoint validates extension, signature, size, duration, FPS, resolution.
- Bounded frame sampling added.
- Java-compatible `data` response preserved; diagnostics added outside `data`.
- `python -m compileall app tests` passed.
- `python -m pytest` passed: 30/30.

## What's Pending

- Phase 2 MediaPipe active pose.
- Phase 3 ONNX anti-spoof.
- Phase 4 scoring/docs finalization.
- Phase 5 test set and threshold tuning.

## Exact Next Action

`/code plans/2026-06-10-ai-kyc-liveness-phase-3/plan.md phase-2`

## Key Files

- `service/ai-kyc-service/app/config.py`
- `service/ai-kyc-service/app/services/liveness_service.py`
- `service/ai-kyc-service/tests/test_liveness_service.py`
- `service/ai-kyc-service/tests/test_api_contracts.py`
