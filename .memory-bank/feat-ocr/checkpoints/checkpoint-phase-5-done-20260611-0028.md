# Checkpoint: phase-5-done

**Date:** 2026-06-11

## What's Done

- Phase 5 testdata layout and threshold tuning framework completed.
- Created local-only `testdata/liveness` buckets.
- Added `.gitignore` blocking real liveness videos/images/data files.
- Added README and threshold tuning template.
- Added guard test for fixture layout.
- `python -m compileall app tests` passed.
- `python -m pytest` passed: 40/40.

## What's Pending

- Real FE videos must be collected locally.
- MediaPipe Face Landmarker and ONNX anti-spoof model files must be selected.
- Threshold tuning must be rerun with collected samples.

## Exact Next Action

Collect real FE videos under `service/ai-kyc-service/testdata/liveness/`, configure model paths, then run manual Postman/curl liveness tests and record observations in `reports/threshold-tuning-*.md`.

## Key Files

- `service/ai-kyc-service/testdata/liveness/README.md`
- `service/ai-kyc-service/testdata/liveness/.gitignore`
- `service/ai-kyc-service/tests/test_liveness_service.py`
- `plans/2026-06-10-ai-kyc-liveness-phase-3/reports/threshold-tuning-2026-06-11-template.md`
