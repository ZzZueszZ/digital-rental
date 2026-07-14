# Test Results Report: Profile eKYC UI Sync

**Date:** 2026-07-14  
**Scope:** current UI-only diff under `frontend/src/app/(main)/profile/ekyc`  
**Product code edits by tester:** none

## Test Results Overview

- Automated unit/integration tests: not applicable; diff changes Tailwind classes/layout only.
- `pnpm lint`: PASS, exit 0. Coordinator evidence reports 547 existing warnings; no blocking lint error.
- `pnpm build`: PASS. Production Next.js build and TypeScript compilation completed successfully.
- `git diff --check`: PASS; no whitespace error.
- Build/type status: no syntax, import, prop, or TypeScript compile failure detected.

Note: duplicate local lint run was stopped on coordinator request after existing successful lint/build evidence was confirmed. Result above uses coordinator's completed run, not the stopped duplicate.

## Diff and Rendering Audit

- Diff limited to nine planned eKYC product files: page shell plus eight route-local components.
- Net product diff: 56 insertions, 44 deletions. Changes are class/layout only.
- No hook, handler, ref, prop signature, state transition, API call, request payload, or shared `Button` change found.
- Loading, active wizard, approved, pending/processing, rejected/failed/cancelled render branches remain reachable by same conditions.
- `TERMINAL_STATUSES`, camera target selection, capture callbacks, recorder cleanup, OCR advance, review submit wiring unchanged.
- `git diff --check` emits only working-copy LF-to-CRLF notices; not content/build failures.

## Button Contrast Audit

- Document actions audited: remove image, capture, close camera, upload label, open camera, back, next.
- Selfie actions audited: remove image, capture, close camera, open/retake, back, next.
- Liveness actions audited: retake video, start/cancel recording, open camera, back, next.
- Review/status actions audited: back, submit, refresh status, retry verification.
- All shared secondary/outline actions now explicitly set light-safe `bg-white`, zinc border, zinc text, and light hover colors. `Mở camera` no longer relies on theme-derived `bg-background`/foreground.
- All primary actions explicitly set `bg-zinc-950` plus `text-white`, zinc hover, and focus ring color.
- Custom remove-image icon buttons already use explicit `bg-zinc-950 text-white`.
- Disabled shared buttons retain base primitive `disabled:opacity-50` and `disabled:pointer-events-none`; explicit foreground/background remain present.
- Control height is consistently `h-10` or `h-11` for styled text actions.

## Responsive Audit

- Main shell padding: `p-5 sm:p-8 md:p-10`; suitable 20 px mobile baseline.
- Document upload/camera pair uses one column by default, two columns from `sm`.
- Document and selfie capture action pairs stack full-width below `sm`, restore intrinsic width at `sm+`.
- All step footer actions stack full-width below `sm`, then use row/auto width at `sm+`; long Vietnamese labels can wrap without forced narrow columns.
- Status refresh/retry controls use full width on mobile and auto width at `sm+`.
- Desktop capture grids remain gated at `lg`; mobile keeps full-width capture surfaces.
- Progress minimum width reduced to 620 px and contained by page-level `overflow-x-auto`; mobile adds visible `Bước n/5` and current-step label.
- Nested review/OCR/status grids remain one column on mobile, two columns from `sm`.

## Coverage Metrics

- Line/branch/function coverage: not collected; no test/coverage script required for this styling-only scope.
- Static branch audit: all active wizard and terminal render branches inspected.

## Critical Issues

- None found in static diff, lint, build, TypeScript, button contrast, or responsive class audit.

## Remaining Runtime Risk

- Authenticated browser eKYC flow not executed in this tester pass.
- Camera permission, live stream rendering, recorder behavior, dark/system-dark visual output, 320/375 px screenshots, keyboard focus, and 200% zoom still need real-browser confirmation.
- Static classes strongly address the reported black/invisible camera button, but runtime visual acceptance needs an authenticated session and camera permission.

## Recommendations / Next Steps

1. Smoke-test `/profile/info` then `/profile/ekyc` at 320, 375, 768, 1024, and 1440 px.
2. Exercise upload, open/close/capture/retake, recorder start/cancel, back/next, submit, refresh, retry, busy, and disabled states.
3. Repeat with saved dark and system-dark preferences; confirm white secondary and black/white primary actions remain legible.
4. Keyboard-test upload label and all buttons; verify visible focus and no page-level horizontal overflow at 200% zoom.

## Unresolved Questions

- Can an authenticated test account/session and browser camera permission be provided for full runtime visual regression?

**Status:** DONE_WITH_CONCERNS  
**Summary:** Static diff, button contrast, responsive classes, lint, build, TypeScript, and whitespace checks pass. Reported camera-button contrast issue is covered by explicit light-safe classes.  
**Concerns/Blockers:** Runtime authenticated camera/full-flow and viewport visual regression not executed.
