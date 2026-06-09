# Phase 03: CCCD Parser And Confidence

## Context Links

- Parent: [plan.md](plan.md)
- Depends on: [phase-02-paddleocr-engine.md](phase-02-paddleocr-engine.md)

## Overview

**Date:** 2026-06-09
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Done
**Review Status:** Self-reviewed

Extract CCCD fields from OCR lines using front/back classification, label anchors, regex fallback, normalization, and per-field confidence.

## Key Insights

- Parser should be independent from PaddleOCR.
- Address/home may span multiple OCR lines.
- Back side may contain issue date/place and MRZ but not front fields.

## Requirements

- Classify card side: `front`, `back`, `unknown`.
- Extract `id`, `name`, `dob`, `sex`, `nationality`, `home`, `address`, `issue_date`, `doe`, `type_new`.
- Use label anchor first, regex fallback second.
- Normalize date to `dd/MM/yyyy`.
- Normalize gender to `NAM` or `NU`.
- Preserve Vietnamese text; uppercase name only.
- Compute `id_prob`, `name_prob`, `dob_prob`, `address_prob`, `home_prob`, `doe_prob`, `issue_date_prob`.

## Architecture

```text
OcrLine[] -> classify side -> anchor spans + regex -> normalized fields -> field confidence
```

## Related Code Files

- Create `service/ai-kyc-service/app/services/cccd_field_extractor.py`
- Modify `service/ai-kyc-service/app/services/cccd_ocr_service.py`
- Add `service/ai-kyc-service/tests/test_cccd_field_extractor.py`

## Implementation Steps

1. Define label sets for front/back Vietnamese and English anchors.
2. Implement accent-insensitive matching.
3. Implement single-line and multiline anchor extraction.
4. Implement regex fallback for ID and dates.
5. Implement normalization functions.
6. Implement field confidence model.
7. Add parser tests for front, back, missing labels, multiline address, malformed dates.

## Todo List

- [x] Card-side classifier.
- [x] Anchor extraction.
- [x] Regex fallback.
- [x] Normalization.
- [x] Per-field confidence.
- [x] Parser tests.

## Success Criteria

- Fake front OCR lines extract required front fields.
- Fake back OCR lines extract issue/expiry where present.
- Missing required fields produces `errorCode=1` in integration phase.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| OCR labels vary by card template | High | Medium | Anchor aliases and regex fallback |
| Multiline address overcaptures | Medium | Medium | Stop at next known label |

## Security Considerations

- Do not log extracted PII.
- Keep extracted fields only in response to backend caller.

## Next Steps

- Phase 4 wires parser into endpoint response.
