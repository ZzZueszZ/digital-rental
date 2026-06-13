# Phase 04: Integration And Tests

## Context Links

- Parent: [plan.md](plan.md)
- Depends on: [phase-01-document-preprocessing.md](phase-01-document-preprocessing.md), [phase-02-paddleocr-engine.md](phase-02-paddleocr-engine.md), [phase-03-cccd-parser-confidence.md](phase-03-cccd-parser-confidence.md)

## Overview

**Date:** 2026-06-09
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Medium
**Implementation Status:** Done
**Review Status:** Self-reviewed

Wire preprocessing, OCR engine, parser, confidence, and FPT-compatible response into `/vision/idr/vnm/`.

## Key Insights

- Spring parser expects `errorCode`, `data[0]`, and FPT field names.
- Tests must stay deterministic without PaddleOCR/model downloads.
- Manual tuning needs real CCCD media later.

## Requirements

- Keep endpoint path, header, multipart field unchanged.
- Return `errorCode=0` only when useful fields are extracted.
- Return `errorCode=1` with partial data for low-confidence extraction.
- Include quality metadata without breaking Java parser.
- Keep existing contract tests passing.
- Document manual test commands.

## Architecture

```text
FastAPI route -> CccdOcrService -> Preprocessor -> OcrEngine -> Extractor -> FPT response
```

## Related Code Files

- Modify `service/ai-kyc-service/app/api/ocr.py` if needed.
- Modify `service/ai-kyc-service/app/services/cccd_ocr_service.py`.
- Modify `service/ai-kyc-service/tests/test_api_contracts.py`.
- Add `service/ai-kyc-service/tests/test_cccd_ocr_service.py`.
- Update `service/ai-kyc-service/README.md`.

## Implementation Steps

1. Refactor `CccdOcrService.recognize` to orchestrate new modules.
2. Map parser output to FPT-compatible JSON.
3. Add integration tests using fake OCR engine injection/monkeypatch.
4. Keep Docker build and pytest green.
5. Update README with OCR testing instructions and caveats.

## Todo List

- [x] Service orchestration.
- [x] FPT response mapper.
- [x] Integration tests.
- [x] README update.
- [x] Compile/test/docker checks.

## Success Criteria

- `pytest` passes without PaddleOCR installed.
- `docker compose build` passes.
- Existing LensHub env URLs remain valid.
- Manual curl command returns FPT-compatible JSON.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Java parser ignores new quality metadata | Low | Low | Add only extra fields under `data[0]` |
| Real OCR quality unknown | High | High | Add unresolved tuning task and manual test set |

## Security Considerations

- No disk persistence for uploaded ID images.
- No raw image/OCR logs.
- API key required as before.

## Next Steps

- Run `/code plans/2026-06-09-ai-kyc-ocr-pipeline/plan.md` after approval.
