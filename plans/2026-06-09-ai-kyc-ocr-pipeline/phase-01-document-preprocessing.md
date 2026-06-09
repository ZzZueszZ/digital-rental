# Phase 01: Document Preprocessing

## Context Links

- Parent: [plan.md](plan.md)
- Research: [researcher-ocr-pipeline.md](research/researcher-ocr-pipeline.md)
- Analysis: [analysis-ai-kyc-ocr-current-state.md](reports/analysis-ai-kyc-ocr-current-state.md)

## Overview

**Date:** 2026-06-09
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Done
**Review Status:** Self-reviewed

Add image quality gates, CCCD contour detection, perspective crop, and rotation candidate generation.

## Key Insights

- Preprocessing should improve OCR but not become a brittle blocker.
- Current quality logic exists but lacks thresholds and flags.
- Document crop should fallback to original image when contour cannot be trusted.

## Requirements

- Validate readable image bytes.
- Return width, height, brightness, blur, and flags: `too_small`, `too_dark`, `too_bright`, `blurry`.
- Detect largest 4-point card-like contour.
- Apply perspective transform when contour confidence is acceptable.
- Generate 0/90/180/270 rotation candidates.

## Architecture

```text
bytes -> PIL/OpenCV decode -> quality report -> contour detect -> crop or original -> rotation candidates
```

## Related Code Files

- Modify `service/ai-kyc-service/app/utils/image_io.py`
- Modify `service/ai-kyc-service/app/services/quality_service.py`
- Create `service/ai-kyc-service/app/services/document_preprocessor.py`
- Add `service/ai-kyc-service/tests/test_document_preprocessor.py`

## Implementation Steps

1. Add encode/decode helpers for CV2 image to JPEG bytes.
2. Add quality threshold settings to `config.py`.
3. Implement `DocumentPreprocessor.preprocess(content)`.
4. Implement contour ordering and perspective transform.
5. Return preprocessing metadata for confidence calculation.
6. Add synthetic image tests for invalid, small, bright/dark, and rectangular document crop.

## Todo List

- [x] Quality threshold config.
- [x] OpenCV contour detection.
- [x] Perspective transform.
- [x] Rotation candidates.
- [x] Unit tests.

## Success Criteria

- Synthetic rectangle image returns `document_detected=true`.
- Invalid bytes return `valid=false`.
- No contour returns original image without exception.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| False contour crop | Medium | Medium | Require area ratio and 4-point approximation |
| Blur threshold too strict | Medium | Medium | Use flags first, tune later |

## Security Considerations

- Do not write uploaded CCCD images to disk.
- Do not log image bytes or OCR text.

## Next Steps

- Phase 2 consumes rotation candidates.
