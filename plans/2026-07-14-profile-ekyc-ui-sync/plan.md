# Profile eKYC UI Sync Plan

**Date:** 2026-07-14  
**Status:** Ready for implementation  
**Scope:** Frontend visual/responsive changes only; preserve current eKYC behavior, state, camera lifecycle, uploads, OCR, liveness, review, submit, and API contracts.

## Objective

Make `/profile/ekyc` feel native to `/profile/info`: same light card system, radius, padding, shadow, typography, neutral colors, and 40–44 px controls. Fix black/invisible camera and other outline buttons by explicitly styling every eKYC secondary action for a light surface. Keep primary actions black with white content, matching profile info.

## Constraints

- Modify only existing eKYC product files listed below; add no component/helper/product file.
- Do not change shared `Button`, global theme/provider, profile shell, hooks, types, constants, utilities, backend, endpoints, payloads, validation, or step transitions.
- Preserve file-input label semantics, camera/video elements, refs, handlers, disabled/loading states, and accessibility names.
- Use existing Tailwind utilities, shared `Button`, and current icons; no dependency or configuration change.

## Exact File List

### Modify

- `frontend/src/app/(main)/profile/ekyc/page.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/document-capture-step.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/selfie-step.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/liveness-step.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/review-step.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/verification-status.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/ekyc-progress.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/photo-guidance.tsx`
- `frontend/src/app/(main)/profile/ekyc/_components/ocr-summary.tsx`

### Reference/read-only

- `frontend/src/app/(main)/profile/info/page.tsx`
- `frontend/src/app/(main)/profile/layout.tsx`
- `frontend/src/components/ui/button.tsx`
- `frontend/src/providers/theme-provider.tsx`
- `frontend/src/styles/globals.css`

## Data Flow (Unchanged)

1. `page.tsx` reads profile verification state and `useEkycFlow`, then selects loading, terminal status, or active wizard UI.
2. `useEkycFlow` remains sole owner of step/session/assets and upload → OCR → selfie → liveness → review → submit orchestration.
3. Capture components continue calling existing props/handlers; camera and recorder hooks continue owning media permissions, streams, captures, cleanup, and errors.
4. Review submits the same data through the same handler/API; verification responses continue feeding `verification-status.tsx`.
5. This change alters classes/layout only. No state shape, callback signature, request order, payload, or response mapping changes.

## Implementation Plan

### 1. Unify route shell and terminal states

- In `page.tsx`, replace the 24 px/deep-shadow wizard shell with profile-info baseline: white background, `rounded-xl`, zinc-100 border, subtle `0 2px 6px` shadow, and matching entry motion.
- Use responsive padding `p-5 sm:p-8 md:p-10`; preserve useful header/body separation without duplicate heavy containers.
- Normalize title/subtitle hierarchy to Inter-derived existing typography: 24 px semibold zinc-950 title, 14 px zinc-500 helper text.
- Apply the same shell language to loading and all terminal branches via `verification-status.tsx`, including approved, processing/pending, rejected, failed, and cancelled.

### 2. Normalize progress and nested content

- Update `ekyc-progress.tsx` colors, spacing, and typography to neutral zinc with restrained red only for progress/accent state.
- Keep all five step semantics and accessibility state. On mobile, contain horizontal scrolling inside the progress region, expose a visible current-step cue, and prevent page-level overflow; retain the desktop horizontal layout.
- Restyle guidance, OCR, preview, and review surfaces in `photo-guidance.tsx`, `ocr-summary.tsx`, and step components with lighter zinc borders/backgrounds and smaller consistent radii; do not flatten functional capture boundaries.

### 3. Standardize all buttons and fix camera rendering

- Give every eKYC secondary action explicit light-safe classes: white background, zinc-300 border, zinc-700/900 icon and text, zinc-50 hover, zinc-950 hover text, visible focus, and disabled styling. Do not rely on `bg-background`/theme foreground.
- Cover document upload/open/close/retake/back, selfie open/close/retake/back, liveness retry/start/cancel/back, and review back controls. Keep the upload `<label>` wired to its hidden input.
- Give all main forward/capture/submit actions explicit zinc-950 background, white content, zinc-800 hover, focus state, and readable disabled/loading states—matching `/profile/info`, not the current red CTA treatment.
- Normalize controls to `h-10` or `h-11` (40–44 px), `rounded-xl`, 14 px medium/semibold text, and consistent 16 px icons. Paired controls use equal height/width.

### 4. Make each step responsive

- Preserve current capture aspect ratios and desktop grids; use full available width on narrow screens.
- Stack document upload/camera actions below `sm`; use two columns from `sm` when space permits.
- Make bottom navigation wrap/stack at 320–575 px, with full-width controls and no Vietnamese label truncation; restore intrinsic/right-aligned controls at `sm+`.
- Ensure 16–20 px effective mobile content padding, no body horizontal scroll, reachable camera controls, and readable content at 200% zoom.

### 5. Verification and scope audit

- Diff handlers/props before and after to confirm changes remain presentational.
- Search the eKYC route for `variant="outline"`, token backgrounds, red CTA classes, and button-like labels; verify every secondary/primary action follows the chosen recipes.
- Confirm no shared primitive, theme, API, hook, or new product file was changed.

## Dependencies

- Existing profile layout and `/profile/info` visual conventions.
- Existing Tailwind CSS 4 utilities, shared `Button`, Lucide icons, and route-local components.
- Existing authenticated profile/eKYC API data and browser camera permission for full manual testing.
- No new package, backend migration, environment variable, or service dependency.

## Tests and Validation

### Automated

From `frontend`:

```powershell
pnpm lint
pnpm build
```

Both commands must exit successfully. Any pre-existing failure must be recorded separately with exact output and not masked by this change.

### Manual functional regression

- Complete front document, back document, selfie, liveness, review, and submission using existing behavior.
- Exercise upload and camera paths; open/close camera, retake, back/next, liveness start/cancel/retry, busy/disabled, permission denied, and error states.
- Confirm inputs still activate, streams/recorders clean up, OCR remains once per existing flow, payload/API calls are unchanged, and loading spinners do not resize controls.
- Check loading plus approved, processing/pending, rejected, failed, and cancelled route states.

### Visual/responsive regression

- Compare `/profile/info` → `/profile/ekyc` at 320, 375, 768, 1024, and 1440 px.
- Test saved dark and system-dark preferences: eKYC remains intentional light UI; all secondary buttons remain white/legible and primary actions black/white.
- Verify no black-on-black camera button, page-level horizontal scrollbar, clipped Vietnamese labels, layout shift, or unreachable action.
- Keyboard-test focus visibility and file/camera actions; check 200% zoom.

## Risks and Mitigations

- **Dark theme leaks through shared variants:** use explicit background, border, text, hover, focus, and disabled classes on every eKYC action; audit route-wide.
- **Style edits accidentally alter behavior:** do not touch hooks/handlers/refs/props; review functional diff and execute full step regression.
- **Mobile footer/progress overflow:** stack/wrap actions, constrain scrolling to progress, validate 320/375 px and long Vietnamese labels.
- **Over-normalizing capture UI harms usability:** retain aspect ratios, overlays, camera feedback, guidance grouping, and state affordances.
- **Shared/global change causes unrelated regressions:** leave theme provider, global CSS, shared Button, profile layout, and info page untouched.
- **Authenticated/media QA unavailable:** lint/build can pass without runtime proof; record blocked scenarios and do not declare visual completion until authenticated browser checks pass.

## Rollback

- Revert only the class/layout edits in the nine listed eKYC files; no data/API rollback required.
- If one responsive or control treatment regresses behavior, revert that component independently because state/hooks remain unchanged.
- Do not roll back by changing global theme or shared `Button`; those are outside scope.

## Success Criteria

- `/profile/ekyc` and every loading/terminal state match `/profile/info` in card radius, border, subtle shadow, padding rhythm, typography, and light neutral palette.
- Every control is 40–44 px high; secondary actions are explicitly white/zinc and primary actions explicitly zinc-950/white across every step/state.
- `Mở camera` and all other outline actions are legible in saved/system dark mode; no black-on-black state.
- Mobile at 320 px has no body overflow, clipped labels, or inaccessible actions; desktop grids remain usable.
- File, camera, OCR, liveness, review, submission, disabled/loading, and status behavior/API contracts are unchanged.
- `pnpm lint` and `pnpm build` pass; authenticated manual checks cover all states listed above.
- Only the nine listed existing eKYC product files are modified during implementation.

## TODOs

- [ ] Implement shell and status alignment.
- [ ] Normalize progress, nested surfaces, and typography.
- [ ] Apply explicit secondary light and primary black/white recipes route-wide.
- [ ] Validate responsive layouts and accessibility states.
- [ ] Run `pnpm lint` and `pnpm build`.
- [ ] Complete authenticated camera/upload/full-flow visual regression and record evidence.

## Unresolved Questions

- None blocking. Product choices are resolved by request: primary actions match `/profile/info` black/white; secondary actions use explicit light styling; mobile progress keeps current semantics with contained scrolling/current-step visibility.

**Status:** READY

**Summary:** Implementation-ready, styling-only plan for synchronizing all eKYC states with profile info while fixing theme-derived camera/outline button contrast and preserving behavior/API.

**Concerns/Blockers:** Full runtime acceptance requires an authenticated eKYC session and browser camera permission; no planning blocker.
