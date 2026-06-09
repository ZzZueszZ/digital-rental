# Implementation Plan: Mandatory Guided Liveness Capture

**Date:** 2026-06-08
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** In Progress
**Complexity:** Medium
**Estimated Effort:** 6-8 hours

## Overview

Make liveness mandatory for eKYC and replace the current one-shot video step with Vietnamese guided active liveness capture. User must complete each face-angle prompt before continuing; backend/FPT remains final security authority.

## Phases

- [x] Phase 1: Backend liveness enforcement - [phase-01-backend-liveness-required.md](phase-01-backend-liveness-required.md)
- [x] Phase 2: Frontend guided liveness UX - [phase-02-frontend-guided-liveness.md](phase-02-frontend-guided-liveness.md)
- [ ] Phase 3: Verification and docs - [phase-03-verification-docs.md](phase-03-verification-docs.md)

## Research Findings

- Active liveness commonly uses user actions such as turning head left/right.
- Capture quality improves with localized guidance, centered face, good lighting, no occlusion.
- Client-side liveness checks are UX quality gates, not security source of truth.

## Proposed Solution

Use a lightweight guided capture state machine in the existing eKYC page:

1. User opens camera.
2. App records a single video while prompts advance: nhìn thẳng, quay trái, quay phải, nhìn thẳng.
3. Each prompt has visual instruction, countdown/progress, and pass indicator.
4. User can only upload/continue after all prompts pass.
5. Submit requires `livenessVideoUrl`; backend rejects missing value.
6. Provider liveness + risk scoring still decides result for admin review.

## Alternatives Considered

- Heavy face landmark model: better angle detection, rejected for MVP due dependency/perf.
- Provider-hosted SDK flow: stronger, rejected because current FPT integration already takes uploaded video.
- Timed prompts only: simplest, accepted with quality caveat.

## Success Metrics

- Submit without liveness fails backend validation.
- Frontend cannot reach final review step until liveness video exists.
- Liveness step uses Vietnamese text and visual progress.
- Video is uploaded only after all angle prompts pass.
- Frontend build/lint and backend tests/compile pass or failures documented.

## References

- Research: [researcher-guided-liveness-ux.md](research/researcher-guided-liveness-ux.md)
- Analysis: [analysis-liveness-codebase.md](reports/analysis-liveness-codebase.md)
- Docs: `docs/system-architecture.md`, `docs/codebase-summary.md`, `docs/code-standards.md`

## Unresolved Questions

- Should Phase 2 include up/down prompts, or keep center/left/right/center MVP?
