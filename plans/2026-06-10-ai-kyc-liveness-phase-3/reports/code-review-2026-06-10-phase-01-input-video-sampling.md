# Code Review Summary: Phase 1 Input Video Sampling

**Date:** 2026-06-10

## Scope

- Files reviewed:
  - `service/ai-kyc-service/app/config.py`
  - `service/ai-kyc-service/app/services/liveness_service.py`
  - `service/ai-kyc-service/tests/test_api_contracts.py`
  - `service/ai-kyc-service/tests/test_liveness_service.py`
- Review focus: input validation, Windows temp file behavior, API compatibility, fail-closed behavior.

## Overall Assessment

Phase 1 is production-safe as a metadata/sampling gate. It does not allow liveness pass without Phase 2 MediaPipe yaw, which matches the plan.

## Critical Issues

- None.

## High Priority Findings

- None.

## Medium Priority Improvements

- `liveness_service.py` should be split in Phase 2 if MediaPipe logic makes it exceed the 200-line target.

## Contract Notes

- Existing Java-compatible `data` keys are unchanged.
- New `diagnostics` is outside `data`.
- Invalid or model-incomplete paths fail closed with HTTP 200 provider-style response.

## Security Notes

- Upload size is checked before writing temp file.
- Temp file is explicitly deleted after OpenCV reads it.
- Diagnostics contain metadata only, not raw media or secrets.

## Unresolved Questions

- [ ] Exact ONNX anti-spoof model still pending.
- [ ] Python runtime for MediaPipe still pending.
