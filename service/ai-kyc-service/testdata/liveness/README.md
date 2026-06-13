# Liveness Test Data

This folder is for local-only liveness videos. Do not commit real face videos or extracted frames.

## Layout

```text
testdata/liveness/
  pass/
  fail_wrong_order/
  fail_no_face/
  fail_multiple_faces/
  fail_spoof_screen/
  fail_short_video/
```

## Minimum Sample Set

- `pass`: at least 10 FE videos following `center -> left -> right -> center`.
- `fail_wrong_order`: at least 3 videos with intentionally wrong sequence.
- `fail_no_face`: at least 3 videos without usable face.
- `fail_multiple_faces`: at least 3 videos with more than one face.
- `fail_spoof_screen`: at least 5 replay/screen/paper attempts.
- `fail_short_video`: at least 3 videos shorter than 4 seconds.

## Tuning Notes

Record observed thresholds in `plans/2026-06-10-ai-kyc-liveness-phase-3/reports/threshold-tuning-*.md`.

Current default config:

```env
KYC_AI_LIVENESS_THRESHOLD=0.80
KYC_AI_LIVENESS_MIN_DURATION_SEC=4.0
KYC_AI_LIVENESS_MAX_DURATION_SEC=8.0
KYC_AI_LIVENESS_MIN_FPS=20.0
KYC_AI_LIVENESS_MIN_WIDTH=640
KYC_AI_LIVENESS_MIN_HEIGHT=480
KYC_AI_LIVENESS_SAMPLE_FPS=2.5
KYC_AI_LIVENESS_MAX_SAMPLE_FRAMES=18
KYC_AI_LIVENESS_MIN_FACE_RATIO=0.80
KYC_AI_LIVENESS_CENTER_YAW_DEG=12.0
KYC_AI_LIVENESS_TURN_YAW_DEG=18.0
KYC_AI_LIVENESS_ANTISPOOF_THRESHOLD=0.75
```
