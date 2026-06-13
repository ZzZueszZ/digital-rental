# Research Report: AI KYC OCR Pipeline

**Date:** 2026-06-09
**Research Question:** How should `service/ai-kyc-service` implement CPU-only Vietnamese CCCD OCR with quality checks, document crop, rotation, PaddleOCR, field extraction, normalization, and confidence?

## Executive Summary

Use a layered OCR pipeline: OpenCV preprocessing first, PaddleOCR `lang=vi` second, deterministic CCCD parser third. Keep the API response FPT-compatible and keep tests mostly parser/preprocessor-level so CI does not need real CCCD media or PaddleOCR model downloads.

## Key Findings

### PaddleOCR fits Vietnamese OCR

- PaddleOCR provides a Python OCR pipeline and language-specific OCR use; use `lang="vi"` for Vietnamese.
- PP-OCRv5 multilingual covers Latin-language scenarios and is the right family to evaluate for Vietnamese/Latin text.
- Source: https://www.paddleocr.ai/main/en/version3.x/pipeline_usage/OCR.html
- Source: https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html

### OpenCV contour + perspective transform is enough for MVP document crop

- The common document-scanner approach is grayscale/blur/Canny, find large 4-point contour, order points, perspective transform.
- This should be a quality enhancer, not hard blocker; many user photos may have background noise.
- Source: https://docs.opencv.org/4.x/d4/d73/tutorial_py_contours_begin.html
- Source: https://docs.opencv.org/4.x/da/d6e/tutorial_py_geometric_transformations.html

### Parser must be independent from OCR engine

- Field extraction should consume normalized OCR lines with confidence and bounding boxes.
- Unit tests can feed fake OCR lines for `id/name/dob/sex/home/address/doe/issue_date` without loading PaddleOCR.
- This isolates most correctness risk in deterministic code.

## Recommendations

1. **Split OCR into four modules.**
   - `document_preprocessor.py`: quality, crop, rotate.
   - `ocr_engine.py`: PaddleOCR singleton and image-to-lines.
   - `cccd_field_extractor.py`: classify, anchors, regex, normalize, confidence.
   - `cccd_ocr_service.py`: orchestration and FPT response mapping.
   - Trade-off: more files, but current one-file service is already mixing concerns.

2. **Use auto-rotate by OCR anchor score.**
   - Run OCR on 0/90/180/270 candidates, select best anchor score.
   - Trade-off: slower CPU path, but only 1 CCCD image/request and much more robust than EXIF-only.

3. **Fail soft on crop, fail hard on invalid image.**
   - Invalid image bytes or very small image => `errorCode != 0`.
   - No document contour => process original image, reduce confidence.
   - Trade-off: less strict, but better for admin-review KYC flow.

## Alternatives Considered

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| PaddleOCR + OpenCV + rule parser | Open source, CPU-capable, controllable | Needs tuning with real CCCD images | Rank 1 |
| Cloud OCR/FPT OCR | Best CCCD-specific quality | Paid, external dependency | Keep as fallback/provider |
| Train custom CCCD OCR model | Best long-term fit | Too much data/time | Not MVP |

## Sources

1. https://www.paddleocr.ai/main/en/version3.x/pipeline_usage/OCR.html
2. https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html
3. https://docs.opencv.org/4.x/d4/d73/tutorial_py_contours_begin.html
4. https://docs.opencv.org/4.x/da/d6e/tutorial_py_geometric_transformations.html

## Next Steps

1. Implement document preprocessing with non-destructive fallback.
2. Implement PaddleOCR singleton and OCR result DTO.
3. Implement deterministic parser tests before using real media.

## Unresolved Questions

- [ ] Representative CCCD front/back images available for tuning?
- [ ] Should OCR low confidence still submit to manual review or block customer immediately?
