# Phase 1: Input & Video Sampling

## Context Links

- Parent: [plan.md](plan.md)
- Current code: `service/ai-kyc-service/app/services/liveness_service.py`
- Config: `service/ai-kyc-service/app/config.py`

## Overview

**Date:** 2026-06-10
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** P0
**Status:** DONE 2026-06-10 - tests 30/30 passed, reviewed with 0 critical issues
**Review Status:** Pending

Build deterministic video validation and bounded sampling. No MediaPipe/ONNX dependency in this phase.

## Key Insights

- This phase removes noisy OpenCV warnings for fake uploads and makes failures traceable.
- Later phases need stable `VideoMetadata` and sampled frames.

## Requirements

- Accept extensions: `.webm`, `.mp4`, `.mov`, `.avi`.
- Size <= `KYC_AI_MAX_UPLOAD_MB`, default 10.
- Duration 4-8s.
- FPS >= 20.
- Resolution >= 640x480.
- Sample at 2-3 FPS, max 18 frames.
- Return diagnostics: `duration_sec`, `fps`, `width`, `height`, `sampled_frames`, `reason`.

## Architecture

`LivenessService.verify` calls a video sampler. Sampler validates file signature, opens `cv2.VideoCapture`, reads metadata, computes target frame indexes, reads only selected frames, and returns metadata + frames.

## Related Code Files

- Modify: `service/ai-kyc-service/app/services/liveness_service.py`
- Modify: `service/ai-kyc-service/app/config.py`
- Modify: `service/ai-kyc-service/tests/test_api_contracts.py`
- Create: `service/ai-kyc-service/tests/test_liveness_service.py`

## Implementation Steps

1. Add config: duration min/max, FPS min, width/height min, sample FPS, max sampled frames.
2. Add internal metadata result object or small dataclass.
3. Validate extension and known file signatures before OpenCV.
4. Extract metadata with `VideoCapture`.
5. Reject invalid metadata fail closed with diagnostics.
6. Sample bounded frames by computed indexes.
7. Preserve Java-compatible `data`.

## Todo List

- [x] Config values added.
- [x] Metadata validator implemented.
- [x] Frame sampler implemented.
- [x] Diagnostics added outside `data`.
- [x] Unit tests for fake file, bad extension, size, short/long, low FPS, low resolution.

## Success Criteria

- Fake/hỏng video returns `passed=false`, `score=0`, clear diagnostics.
- Too short/long videos fail.
- Sampling never decodes all frames by design.
- Existing API contract test still passes.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| OpenCV cannot read browser `.webm` codec | Medium | High | Return `video_unreadable`; document FE should produce common webm/mp4 codec |
| Tests need video fixtures | Medium | Medium | Generate tiny synthetic videos with OpenCV in tests |

## Security Considerations

- Keep max upload cap before temp file write.
- Delete temp files via context manager.
- Do not log raw video paths beyond request diagnostics.

## Next Steps

Run `/code plans/2026-06-10-ai-kyc-liveness-phase-3/plan.md` and implement Phase 1 first.
