# Evidence: FEAT-AI-KYC-BE

## 1 Research Findings

- Active liveness uses explicit actions like head turn left/right; fit request for guided angle capture.
- Face capture quality depends on lighting, centered face, visible full face, stable movement.
- Client-side checks should improve UX/video quality, not be trusted as final anti-spoof decision.

## 2 Key Decisions

- Make `livenessVideoUrl` required in backend DTO and service validation.
- Keep FPT/mock provider as final liveness decision source.
- Implement lightweight browser quality gates without adding heavy ML dependency first.

## 3 Constraints & Risks

- Browser-only angle validation is approximate unless using landmarks/model.
- Existing page is large; keep change scoped and avoid broad refactor.
- eKYC media is sensitive; current public upload concern remains out of scope for this phase.
