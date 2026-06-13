# Implementation Plan: AI KYC Liveness Phase 3

**Date:** 2026-06-10
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** High
**Estimated Effort:** 14-20 hours

## Overview

Implement CPU-only `/dmp/liveness/v3` that validates real video input, samples bounded frames, checks active sequence `center -> left -> right -> center`, optionally runs ONNX anti-spoof, and fails closed when input/model is invalid.

## Goals

- [ ] Keep Java parser compatibility: `data.score`, `data.passed`, `data.spoof_detected`, `data.multiple_faces_detected`.
- [ ] Add diagnostics outside `data` for debugging.
- [ ] Reject fake, oversized, short/long, low-FPS, low-resolution, unreadable videos.
- [ ] Validate active pose sequence with MediaPipe yaw, not Haar-only heuristic.
- [ ] Add ONNX anti-spoof after pose path is stable.

## Research Findings

- OpenCV VideoCapture fits metadata and bounded frame sampling.
- MediaPipe Face Landmarker is best fit for CPU landmark/yaw validation, but Python 3.13 support is a deployment risk.
- ONNX Runtime CPUExecutionProvider fits passive anti-spoof inference once model contract is pinned.

## Data Flow

Multipart `video` + optional `cmnd` -> size/extension/signature check -> temp video -> OpenCV metadata -> bounded frame sampling -> active pose validator -> optional anti-spoof validator -> score combiner -> FPT-compatible JSON.

## Phases

- [x] Phase 1: [Input & Video Sampling](phase-01-input-video-sampling.md) - DONE 2026-06-10, tests 30/30 passed
- [x] Phase 2: [Active Pose Liveness](phase-02-active-pose-liveness.md) - DONE 2026-06-11, tests 35/35 passed
- [x] Phase 3: [Passive Anti-Spoof ONNX](phase-03-passive-antispoof-onnx.md) - DONE 2026-06-11, tests 38/38 passed
- [x] Phase 4: [Score, Response, Docs](phase-04-score-response-docs.md) - DONE 2026-06-11, tests 39/39 passed
- [x] Phase 5: [Test Set & Threshold Tuning](phase-05-test-set-threshold-tuning.md) - DONE 2026-06-11, tests 40/40 passed

## Dependency Graph

Phase 1 blocks all later phases. Phase 2 needs Phase 1 sampled frames. Phase 3 needs Phase 1 samples and chosen ONNX model. Phase 4 spans each implementation but final scoring needs Phase 2/3 outputs. Phase 5 starts after Phase 1 unit hooks and continues through Phase 3.

## Backward Compatibility

Do not change endpoint path, headers, multipart names, HTTP 200 behavior, or `data` keys. New fields may be added only outside `data`, e.g. `diagnostics`.

## Rollback

Rollback per phase by disabling new config gates: `KYC_AI_ENABLE_MEDIAPIPE=false`, `KYC_AI_ENABLE_ONNX_ANTISPOOF=false`, or reverting `liveness_service.py` to Phase 1 fail-closed metadata validator.

## References

- [Research report](research/researcher-liveness-runtime.md)
- [Current-state analysis](reports/analysis-current-liveness.md)
- [AI service README](../../service/ai-kyc-service/README.md)
- [System architecture](../../docs/system-architecture.md)

## Unresolved Questions

- [ ] Which ONNX anti-spoof model will be pinned?
- [ ] Will local/prod Python runtime move to 3.11/3.12 if MediaPipe is unavailable on 3.13?
