# Threshold Tuning Report: Liveness

**Date:** 2026-06-11

## Current Status

No real FE liveness videos were available in this coding session. Thresholds remain defaults from the plan.

## Required Local Sample Counts

| Bucket | Required | Collected | Notes |
| --- | ---: | ---: | --- |
| pass | 10 | 0 | Need real FE videos |
| fail_wrong_order | 3 | 0 | Need real FE videos |
| fail_no_face | 3 | 0 | Need real videos |
| fail_multiple_faces | 3 | 0 | Need controlled videos |
| fail_spoof_screen | 5 | 0 | Need replay/paper/screen attempts |
| fail_short_video | 3 | 0 | Need short clips |

## Decision Rules To Tune

- `KYC_AI_LIVENESS_THRESHOLD`
- `KYC_AI_LIVENESS_MIN_FACE_RATIO`
- `KYC_AI_LIVENESS_CENTER_YAW_DEG`
- `KYC_AI_LIVENESS_TURN_YAW_DEG`
- `KYC_AI_LIVENESS_ANTISPOOF_THRESHOLD`

## Unresolved Questions

- [ ] Which MediaPipe Face Landmarker model path will be used locally?
- [ ] Which ONNX anti-spoof model/license will be pinned?
- [ ] Which FE browser/device matrix will be used for threshold tuning?
