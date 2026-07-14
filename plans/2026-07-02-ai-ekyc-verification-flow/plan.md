# Implementation Plan: Regenerate AI-eKYC Verification Flow

**Date:** 2026-07-02
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Implemented; browser visual QA pending
**Complexity:** High
**Estimated Effort:** 1-2 days

## Overview

Rebuild customer eKYC wizard as focused React components while preserving current Spring Boot and AI-provider contracts. Improve step clarity, camera/liveness guidance, retry behavior, responsive UI, and maintainability.

## Current Findings

- Existing customer flow covers CCCD front/back, OCR preview, selfie, liveness, review, submit, and terminal statuses.
- `frontend/src/app/(main)/profile/ekyc/page.tsx` is 1,843 lines and owns UI, media APIs, uploads, orchestration, and status rendering.
- New flow already uses private `FileAsset` IDs. Legacy multipart endpoints stay untouched for compatibility.
- Backend final authority remains manual review after OCR, face match, liveness, and risk scoring.
- Existing API contract is sufficient; no database or provider change required.

## Data Flow

1. `POST /ekyc/initiate` creates/restarts session.
2. Browser captures/selects CCCD files and uploads private assets.
3. `POST /ekyc/ocr-preview` extracts and persists CCCD fields.
4. Browser captures live selfie and guided 6-second liveness video.
5. `POST /ekyc/submit` passes four asset IDs.
6. Backend reuses OCR, runs face match/liveness/risk scoring, returns `PENDING_REVIEW`.
7. Admin approve/reject updates customer status.

## Implementation Phases

### Phase 1: State and Media Core

- [x] Extract typed wizard state, constants, image/video utilities.
- [x] Extract camera, capture, liveness recording, upload, OCR, and submit orchestration into hooks.
- [x] Revoke browser object URLs and stop media tracks/timeouts on reset/unmount.

### Phase 2: Wizard UI

- [x] Build labeled five-step progress rail.
- [x] Build reusable document capture step with quality guidance.
- [x] Build camera-only selfie step.
- [x] Build guided liveness step matching concept.
- [x] Build OCR/review/submit step and privacy reassurance.

### Phase 3: Terminal States

- [x] Rebuild loading, approved, pending-review, rejected, and failed/processing views.
- [x] Remove fabricated fallback AI scores; render missing values honestly.
- [x] Preserve retry and refresh actions.

### Phase 4: Verification and Docs

- [x] Run targeted frontend lint and production build.
- [ ] Browser-test desktop/mobile core states and camera permission failure.
- [x] Review changed code and update project roadmap. Existing eKYC diagram remains contract-accurate.

## File Ownership

- Route composition: `frontend/src/app/(main)/profile/ekyc/page.tsx`
- Components/hooks/utils: `frontend/src/app/(main)/profile/ekyc/_components/*`, `_hooks/*`, `ekyc-*`
- API contract: `frontend/src/services/identity.ts` only if typing cleanup is required
- Docs: this plan and existing eKYC flow diagram only if contract/behavior changes

## Test Matrix

- Unit/static: TypeScript, ESLint, Next production compile.
- Integration: initiate, four private uploads, OCR preview, submit, status refresh.
- Browser: file upload, camera denial, retake/reset, liveness cancel/complete, responsive layout.
- Regression: approved/pending/rejected render; admin/backend API paths unchanged.

## Risks and Rollback

- MediaRecorder/browser variance: retain supported MIME detection and duration fallback.
- Lost assets during step reset: clear only the changed step and downstream derived data.
- Object URL leaks: central cleanup on replacement/reset/unmount.
- Rollback: revert frontend route/component changes; backend and stored sessions remain compatible.

## Success Criteria

- Complete five-step flow works with existing APIs.
- No fabricated verification metrics.
- Main route becomes composition-only; focused files remain reviewable.
- Desktop/mobile UI matches approved concept direction.
- Lint/build pass.

## Unresolved Questions

- Browser plugin timed out after backend recovery; desktop/mobile screenshot fidelity and camera permission interaction remain unverified.
