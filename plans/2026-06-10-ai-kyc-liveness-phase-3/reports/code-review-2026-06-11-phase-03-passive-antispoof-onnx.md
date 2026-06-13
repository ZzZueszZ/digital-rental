# Code Review Summary: Phase 3 Passive Anti-Spoof ONNX

**Date:** 2026-06-11

## Scope

- Files reviewed:
  - `service/ai-kyc-service/app/config.py`
  - `service/ai-kyc-service/app/services/liveness_antispoof.py`
  - `service/ai-kyc-service/app/services/liveness_pose.py`
  - `service/ai-kyc-service/app/services/liveness_service.py`
  - `service/ai-kyc-service/tests/test_liveness_service.py`
  - `service/ai-kyc-service/README.md`

## Overall Assessment

Phase 3 is acceptable as a CPU-only ONNX anti-spoof scaffold. It uses config-owned model paths, CPUExecutionProvider, bounded frame/crop processing, and fail-closed behavior when enabled but unavailable.

## Critical Issues

- None.

## High Priority Findings

- None.

## Medium Priority Improvements

- Exact ONNX model, license, input preprocessing, and live class index still need pinning before production use.
- Runtime behavior must be validated with real spoof/live FE videos.

## Contract Notes

- Java-compatible `data` object remains stable.
- Anti-spoof failure reason is exposed through diagnostics outside `data`.
- If active pose passes but anti-spoof model is missing, the response fails closed.

## Security Notes

- Model path comes from env/config only.
- No model download happens at request time.
- Raw video/crops are not returned in diagnostics.

## Unresolved Questions

- [ ] Which ONNX model file/license will be used?
- [ ] What exact model preprocessing should be locked?
- [ ] What live class index is correct for selected model?
