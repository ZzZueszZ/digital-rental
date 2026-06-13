# Phase 3: Passive Anti-Spoof ONNX

## Context Links

- Parent: [plan.md](plan.md)
- Depends on: [phase-01-input-video-sampling.md](phase-01-input-video-sampling.md)
- Can run after Phase 2 active pose is stable.

## Overview

**Date:** 2026-06-10
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** P1
**Status:** DONE 2026-06-11 - tests 38/38 passed, reviewed with 0 critical issues
**Review Status:** Pending

Add CPU-only passive anti-spoof model inference.

## Key Insights

- Model preprocessing differs across MiniFASNet/anti-spoof ONNX variants.
- Do not implement until exact model file, input shape, normalization, and live class output are pinned.

## Requirements

- Use `onnxruntime` CPUExecutionProvider only.
- Select 8-12 best frames with exactly one face.
- Crop face and expand bbox 20-40%.
- Resize/normalize per selected model contract.
- Aggregate live scores using percentile 25.
- `spoof_detected = antispoof_score < 0.75`.
- If enabled and unavailable, fail closed.

## Architecture

`AntiSpoofValidator` receives sampled frames and face boxes from active pose path. It loads one ONNX session lazily, preprocesses crops, runs CPU inference, aggregates score, and returns availability + reason.

## Related Code Files

- Modify: `service/ai-kyc-service/app/services/liveness_service.py`
- Modify: `service/ai-kyc-service/app/config.py`
- Modify: `service/ai-kyc-service/README.md`
- Add model file outside git or document `models/` path with `.gitignore`.

## Implementation Steps

1. Add config: model path, input width/height, expand ratio, threshold.
2. Add lazy ONNX session with CPU provider validation.
3. Reuse face boxes from Phase 2; do not redetect if available.
4. Implement model-specific preprocessing after model selection.
5. Aggregate percentile 25.
6. Combine diagnostics: frame count, score distribution, unavailable reason.

## Todo List

- [ ] Pin model and license.
- [x] Add config for model path/preprocessing.
- [x] Implement ONNX session loader.
- [x] Implement crop/preprocess/inference.
- [x] Add tests with mocked session and deterministic outputs.

## Success Criteria

- Screen/paper replay samples trend lower than live samples in internal test set.
- Missing model fails closed unless explicit active-only mode is configured.
- CPU provider is enforced.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Weak open-source anti-spoof model | High | High | Treat as risk signal, keep manual review, tune with real attacks |
| Model license unclear | Medium | High | Pin source/license before committing docs |

## Security Considerations

- Do not download model at request time.
- Do not accept model path from request.

## Next Steps

Choose model file and collect spoof samples before enabling by default.
