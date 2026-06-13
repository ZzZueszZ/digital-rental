# Code Review Summary: Phase 5 Test Set Threshold Tuning

**Date:** 2026-06-11

## Scope

- Files reviewed:
  - `service/ai-kyc-service/testdata/liveness/.gitignore`
  - `service/ai-kyc-service/testdata/liveness/README.md`
  - `service/ai-kyc-service/testdata/liveness/*/.gitkeep`
  - `service/ai-kyc-service/tests/test_liveness_service.py`
  - `service/ai-kyc-service/README.md`
  - `plans/2026-06-10-ai-kyc-liveness-phase-3/reports/threshold-tuning-2026-06-11-template.md`

## Overall Assessment

Phase 5 is ready as a repo-safe testdata and tuning framework. It intentionally does not include real videos and documents that real threshold tuning remains blocked until FE liveness samples and selected models are available.

## Critical Issues

- None.

## Security Notes

- Real face videos/images are ignored by `testdata/liveness/.gitignore`.
- Only README, `.gitignore`, and `.gitkeep` files are intended for git.

## Unresolved Questions

- [ ] Real FE videos still need to be collected locally.
- [ ] MediaPipe and ONNX model files still need to be selected and tested.
