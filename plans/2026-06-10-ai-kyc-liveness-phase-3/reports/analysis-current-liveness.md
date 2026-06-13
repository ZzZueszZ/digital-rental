# Analysis Report: Current Liveness State

**Date:** 2026-06-10

## Current Code

- Endpoint: `service/ai-kyc-service/app/api/liveness.py`
- Service: `service/ai-kyc-service/app/services/liveness_service.py`
- Config: `service/ai-kyc-service/app/config.py`
- Contract test: `service/ai-kyc-service/tests/test_api_contracts.py`

## Findings

- Current response is Java-compatible under `data`.
- Current service validates empty upload and max size.
- Current file signature guard rejects fake `.webm` before OpenCV warning.
- Current OpenCV sampling uses max 12 frames but does not validate duration, FPS, width, height.
- Current pose check is face-center heuristic, not yaw/head pose.
- Current Haar fallback can detect face count but must not be used as production pass condition.
- No anti-spoof model path/config exists yet.

## Needed Refactor

- Split video sampling/metadata from liveness scoring.
- Add diagnostics outside `data`.
- Add model dependency fail-closed paths with clear `reason`.
- Keep endpoint path, multipart field names, and `data` shape stable.

## Unresolved Questions

- [ ] Need real FE videos for threshold tuning.
