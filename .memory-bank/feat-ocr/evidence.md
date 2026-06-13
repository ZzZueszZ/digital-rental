# Evidence: FEAT-OCR

## 1 Research Findings

- MediaPipe Face Landmarker is the target active-pose detector because it returns face landmarks in Python and can run locally on CPU with a task model file.
- ONNX Runtime CPUExecutionProvider is the target passive anti-spoof runtime.
- OpenCV VideoCapture remains the lowest-risk video metadata and sampling layer.
- Local risk: MediaPipe wheels may not support current Windows Python 3.13. Plan must fail closed when unavailable and recommend Python 3.11/3.12 for model runtime.

## 2 Key Decisions

- Implement Phase 1 first without MediaPipe/ONNX dependency.
- Keep Java-compatible `data` object stable; add diagnostics outside `data`.
- Treat OpenCV/Haar fallback as debug/fail-closed only, not a pass condition for production liveness.

## 3 Constraints & Risks

- CPU-only target.
- Video limit 10MB, 4-8s, FPS >= 20, resolution >= 640x480.
- FE sequence is fixed: center -> left -> right -> center.
