# Implementation Plan: AI KYC OCR Pipeline

**Date:** 2026-06-09
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** High
**Estimated Effort:** 14-18 hours

## Overview

Upgrade `service/ai-kyc-service` OCR from contract stub/basic parser to a CPU-only Vietnamese CCCD OCR pipeline: image quality, document crop, auto-rotate, PaddleOCR `lang=vi`, front/back classification, field extraction, normalization, confidence, and FPT-compatible response.

## Phase Plan

| Phase | Status | File |
| --- | --- | --- |
| 1. Document preprocessing | Done | [phase-01-document-preprocessing.md](phase-01-document-preprocessing.md) |
| 2. PaddleOCR engine | Done | [phase-02-paddleocr-engine.md](phase-02-paddleocr-engine.md) |
| 3. CCCD parser and confidence | Done | [phase-03-cccd-parser-confidence.md](phase-03-cccd-parser-confidence.md) |
| 4. Integration and tests | Done | [phase-04-integration-tests.md](phase-04-integration-tests.md) |

## Key Decisions

- Keep Java/backend unchanged; only improve `service/ai-kyc-service`.
- Split OCR responsibilities into preprocessor, OCR engine, parser, and response mapper.
- Fail hard only on invalid/too-small image; fail soft on no contour by using original image with lower confidence.
- Unit test parser with fake OCR lines; real CCCD media is optional for manual/tuning tests.
- Keep FPT-compatible response fields consumed by `FptKycProvider`.

## Success Criteria

- OCR endpoint contract remains unchanged.
- Image quality includes size, blur, brightness, and actionable flags.
- Document crop works when a card-like 4-point contour exists.
- Auto-rotate selects best candidate by anchor score.
- PaddleOCR is initialized once, not per request.
- Parser extracts front/back fields by label anchors and regex.
- Per-field confidence is returned as FPT-style `*_prob`.
- `pytest` passes without PaddleOCR installed.

## Dependencies

- Internal: existing `service/ai-kyc-service` FastAPI app.
- External runtime: OpenCV, Pillow, NumPy already in requirements.
- Optional runtime: `paddleocr`, `paddlepaddle` for real OCR.

## Risk Summary

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| OCR quality poor on real CCCD | High | High | Need representative media and threshold tuning |
| PaddleOCR install slow/heavy | Medium | Medium | Lazy import, optional dependency, parser tests independent |
| Contour crop fails on noisy background | Medium | Medium | Fallback to original image, reduce confidence |
| Parser brittle across card templates | High | Medium | Anchor + regex + multiline tests |

## References

- [Research report](research/researcher-ocr-pipeline.md)
- [Current state analysis](reports/analysis-ai-kyc-ocr-current-state.md)
- `service/ai-kyc-service/kyc-ai-service-plan.md`
- `docs/system-architecture.md`

## Next Steps

1. Review this plan.
2. Run `/code plans/2026-06-09-ai-kyc-ocr-pipeline/plan.md`.

## Unresolved Questions

- [ ] Representative CCCD images/videos available for tuning?
- [ ] OCR low confidence should block submit or continue to manual review?
