# Analysis Report: Current AI KYC OCR State

**Date:** 2026-06-09

## Current Files

- `service/ai-kyc-service/app/services/cccd_ocr_service.py`
- `service/ai-kyc-service/app/services/quality_service.py`
- `service/ai-kyc-service/app/utils/image_io.py`
- `service/ai-kyc-service/tests/test_api_contracts.py`

## Findings

- OCR endpoint already exists and returns FPT-compatible top-level shape.
- Current `CccdOcrService` mixes OCR engine, parser, normalization, confidence, and response mapping.
- `PaddleOCR` is imported lazily but instantiated per request; must become singleton/cache.
- Current parser has mojibake in regex strings and weak label handling.
- Current quality check returns width, height, brightness, blur, but has no threshold decision model.
- No document crop/perspective transform exists.
- No auto-rotate exists.
- Tests only verify endpoint contract, not OCR field extraction.

## Constraints

- Keep Spring `FptKycProvider` unchanged.
- Keep endpoint path and multipart field: `POST /vision/idr/vnm/`, header `api-key`, form field `image`.
- CPU-only.
- Tests must not require real CCCD images or PaddleOCR model downloads.

## Recommended File Ownership

- Add `app/services/document_preprocessor.py`.
- Add `app/services/ocr_engine.py`.
- Add `app/services/cccd_field_extractor.py`.
- Refactor `app/services/cccd_ocr_service.py` into orchestration only.
- Extend `app/utils/image_io.py` only for shared encode/decode helpers.
- Add unit tests under `tests/test_cccd_field_extractor.py`, `tests/test_document_preprocessor.py`, `tests/test_cccd_ocr_service.py`.

## Unresolved Questions

- [ ] Need preserve raw OCR lines in response `data[0].quality` for admin/debug?
- [ ] Need store cropped document image for audit, or keep in-memory only?
