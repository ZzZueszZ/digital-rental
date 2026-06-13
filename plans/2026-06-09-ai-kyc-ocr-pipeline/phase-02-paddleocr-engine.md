# Phase 02: PaddleOCR Engine

## Context Links

- Parent: [plan.md](plan.md)
- Depends on: [phase-01-document-preprocessing.md](phase-01-document-preprocessing.md)

## Overview

**Date:** 2026-06-09
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Done
**Review Status:** Self-reviewed

Wrap PaddleOCR in a lazy singleton engine and select the best rotation candidate by OCR anchor score.

## Key Insights

- Current service instantiates `PaddleOCR` per request; too slow.
- Tests must pass without PaddleOCR installed.
- Auto-rotate by OCR anchors is slower but robust and simple.

## Requirements

- Create OCR line DTO with `text`, `confidence`, optional `bbox`.
- Lazy singleton `PaddleOCR(use_angle_cls=True, lang="vi")`.
- If PaddleOCR missing, return empty lines and explicit engine status.
- OCR all rotation candidates, score anchors, select best.
- Do not expose stack traces to API response.

## Architecture

```text
rotation candidates -> OcrEngine.recognize -> anchor score -> best OcrResult
```

## Related Code Files

- Create `service/ai-kyc-service/app/services/ocr_engine.py`
- Modify `service/ai-kyc-service/app/services/cccd_ocr_service.py`
- Modify `service/ai-kyc-service/requirements.txt` comments only if needed.
- Add `service/ai-kyc-service/tests/test_ocr_engine.py`

## Implementation Steps

1. Define `OcrLine` and `OcrResult` dataclasses.
2. Implement `PaddleOcrEngine` with cached instance.
3. Normalize PaddleOCR result shape to DTO.
4. Implement anchor scoring for Vietnamese/English CCCD labels.
5. Add tests using a fake engine.

## Todo List

- [x] OCR DTOs.
- [x] Lazy singleton.
- [x] Candidate scoring.
- [x] Missing dependency fallback.
- [x] Fake-engine tests.

## Success Criteria

- Service does not crash when PaddleOCR is not installed.
- Fake candidate with CCCD anchors is selected over blank candidate.
- OCR object is not re-created per request.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| PaddleOCR API shape changes | Medium | Medium | Normalize defensively |
| CPU latency high | Medium | Medium | Limit rotation OCR to cropped image candidates |

## Security Considerations

- Do not include raw OCR text in logs.
- Return generic message on engine failure.

## Next Steps

- Phase 3 parses selected OCR lines.
