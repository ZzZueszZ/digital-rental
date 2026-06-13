# Research Report: Liveness Runtime Choices

**Date:** 2026-06-10
**Research Question:** Which CPU-only libraries fit `/dmp/liveness/v3` active pose + passive anti-spoof?

## Executive Summary

Use OpenCV for video metadata/sampling, MediaPipe Face Landmarker for active head-pose landmarks, and ONNX Runtime CPUExecutionProvider for passive anti-spoof. Phase 1 can ship without model dependencies; Phase 2/3 must fail closed when dependency/model is missing.

## Key Findings

### OpenCV VideoCapture

- Fits metadata checks: FPS, frame count, width, height.
- Fits bounded sampling: seek/read selected frames instead of decoding all frames.
- Source: https://docs.opencv.org/4.x/d8/dfe/classcv_1_1VideoCapture.html

### MediaPipe Face Landmarker

- Provides Python face landmark detection suitable for deriving yaw/head pose.
- Requires local model/task asset.
- Good fit for active pose sequence, but install/runtime compatibility must be verified on target Python.
- Source: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/python

### ONNX Runtime

- CPUExecutionProvider is available for CPU inference.
- Good fit for MiniFASNet/face anti-spoof ONNX model variants.
- Source: https://onnxruntime.ai/docs/execution-providers/CPU-ExecutionProvider.html

## Recommendations

1. Ship Phase 1 metadata/sampling first.
2. Add MediaPipe only behind `KYC_AI_ENABLE_MEDIAPIPE=true` and fail closed if unavailable.
3. Add anti-spoof only when a pinned ONNX model file and preprocessing contract are selected.

## Alternatives Considered

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Haar/OpenCV only | Easy, already present | Not real yaw, weak security | Debug only |
| MediaPipe pose | CPU, landmarks | Wheel/model dependency | Chosen for Phase 2 |
| ONNX anti-spoof | CPU, model-swappable | Model preprocessing varies | Chosen for Phase 3 |

## Unresolved Questions

- [ ] Which exact ONNX anti-spoof model file will be pinned?
- [ ] Will production venv use Python 3.11/3.12 if MediaPipe is not available on Python 3.13?
