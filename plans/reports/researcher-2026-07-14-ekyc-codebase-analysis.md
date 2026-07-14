# eKYC Frontend Codebase Analysis

**Date:** 2026-07-14  
**Scope:** compare `/profile/info` and `/profile/ekyc`; locate reusable UI patterns; diagnose button rendering. No product code changed.

## Executive Findings

- Both routes already share `frontend/src/app/(main)/profile/layout.tsx`; sidebar, sticky header, content width, page title/subtitle need no duplicate work.
- `/profile/info` visual baseline: one white `rounded-xl` card, `border-zinc-100`, `p-8 md:p-10`, subtle `0 2px 6px` shadow, 2-column form, 40px controls, zinc text, black primary action.
- `/profile/ekyc` uses a separate visual dialect: `rounded-[24px]`, `border-zinc-200`, large `0 20px 70px` shadow, red primary actions, many `rounded-2xl` subcards. This is the main reason it does not feel synchronized with `/profile/info`.
- Camera button defect has a deterministic theme cause. Global `ThemeProvider` defaults to dark, while customer/profile pages hard-code light surfaces. Shared `Button` `outline` uses theme token `bg-background`; under `.dark`, that token is near-black. The upload control beside it is a hard-coded white `<label>`, producing the screenshot's white/black mismatch.
- The same defect can affect every eKYC `variant="outline"` button, not only “Mở camera”.

## Route and Ownership Map

| Concern | Exact file | Role |
| --- | --- | --- |
| Shared account shell | `frontend/src/app/(main)/profile/layout.tsx` | Sidebar, mobile drawer, sticky page header, max-width `1320px`, zinc page background |
| Reference UI | `frontend/src/app/(main)/profile/info/page.tsx` | White card, title block, avatar, 2-column form, footer actions |
| eKYC orchestration | `frontend/src/app/(main)/profile/ekyc/page.tsx` | Loading/terminal status branching, wizard shell, step wiring |
| Document step | `.../profile/ekyc/_components/document-capture-step.tsx` | CCCD preview, upload input, camera buttons; screenshot defect at lines 94-112 |
| Selfie step | `.../profile/ekyc/_components/selfie-step.tsx` | Portrait camera and retake controls |
| Liveness step | `.../profile/ekyc/_components/liveness-step.tsx` | Camera/video prompt UI and recorder controls |
| Review step | `.../profile/ekyc/_components/review-step.tsx` | OCR/media confirmation and submit |
| Status UI | `.../profile/ekyc/_components/verification-status.tsx` | Approved/pending/rejected states |
| Progress | `.../profile/ekyc/_components/ekyc-progress.tsx` | Five-step horizontal indicator, fixed min width 680px |
| Guidance/OCR | `photo-guidance.tsx`, `ocr-summary.tsx` | Side guidance and extracted CCCD fields |
| Flow state | `.../profile/ekyc/_hooks/use-ekyc-flow.ts` | Session, assets, upload/OCR/submit busy states |
| Camera behavior | `.../profile/ekyc/_hooks/use-ekyc-camera.ts` | `getUserMedia`, stream lifecycle, capture |
| Shared button | `frontend/src/components/ui/button.tsx` | Base UI primitive and CVA variants |
| Theme defaults | `frontend/src/providers/theme-provider.tsx` | `attribute='class'`, `defaultTheme='dark'` |
| Theme tokens | `frontend/src/styles/globals.css` | Light/dark `--background`, `--foreground`, borders |

## `/profile/info` Patterns to Reuse

Source: `frontend/src/app/(main)/profile/info/page.tsx`.

- Page card: `bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-[0_2px_6px_rgba(0,0,0,0.04)]`.
- Entry motion: `animate-in fade-in slide-in-from-right-4 duration-500`.
- Page heading: 24px semibold, zinc-950; supporting text zinc-500.
- Form/control sizing: `h-10`, `rounded-xl`; labels 14px medium; input content 14px semibold.
- Footer: top spacing, right-aligned actions; outline secondary action and explicit zinc-950 primary action.
- Color language: mostly neutral zinc; red used as accent/focus/avatar edit rather than every primary action.

Suggested eKYC alignment: retain wizard-specific capture layouts and progress semantics, but adopt the reference card radius/border/shadow/padding, 40px action sizing, neutral text hierarchy, and black main CTA. Avoid copying profile form-only details.

## Current eKYC Visual Differences

- Wizard shell (`page.tsx:50`): 24px radius and oversized shadow versus info's 12px radius/subtle shadow.
- Header/body split (`page.tsx:51-63`): useful structure, but padding differs from reference; can retain divider while matching `p-8 md:p-10` rhythm.
- Step internals: widespread 16px radii and stronger borders make nested boxes visually heavier.
- Actions: mixed red default, token-based outline, explicit white labels, and explicit zinc buttons. No single light-mode button recipe.
- Progress: `min-w-[680px]` forces horizontal scrolling below 680px; functional but less integrated with the compact reference page.
- Repeated section headers across four steps are consistent and reusable; only their spacing/type scale needs normalization.
- Loading and `VerificationStatus` use separate 24px cards, so alignment must cover wizard, loading, and terminal states.

## Camera Button Root Cause

Evidence chain:

1. `frontend/src/app/providers.tsx:16` wraps the whole app in `ThemeProvider` without an override.
2. `frontend/src/providers/theme-provider.tsx:8-12` sets `attribute='class'` and `defaultTheme='dark'`.
3. `frontend/src/styles/globals.css:82-101` maps `.dark --background` to near-black.
4. `frontend/src/components/ui/button.tsx:14-15` defines outline as `border-border bg-background ...` and does not explicitly set a normal-state foreground.
5. `document-capture-step.tsx:110-112` renders “Mở camera” as `Button variant="outline"`; it therefore receives near-black background in the default dark theme.
6. The adjacent file picker (`document-capture-step.tsx:95`) explicitly uses `bg-white`, so both controls diverge exactly as shown in the supplied screenshot.

High-confidence fix boundary: profile/eKYC should consistently opt into light-theme styles. For this task, local explicit light classes on affected eKYC controls are lower risk than changing the global theme or shared Button behavior, which could alter unrelated admin/public screens. An alternate architectural fix is a light theme boundary for the `(main)`/profile route, but this has broader scope and needs regression coverage.

## Other Buttons at Risk

Token-based outline buttons appear throughout eKYC:

- Document: “Đóng camera”, “Mở camera”, “Quay lại”.
- Selfie: “Đóng camera”, “Chụp lại”, “Quay lại”.
- Liveness: “Quay lại video” (partially protected by `bg-white`), “Bắt đầu ghi/Hủy quay”, “Quay lại”.
- Review: “Quay lại”.

Normal/default buttons usually override red/zinc backgrounds, so they are less exposed. Disabled opacity can further reduce already-poor contrast but is not the original black background cause.

## Reusable Components and Implementation Boundaries

- Keep existing step components/hooks; redesign is styling/layout only. Camera/OCR/upload/recorder behavior need not be rewritten.
- Use shared `Button` and lucide icons per project standards, but provide explicit light-surface classes where profile theme context is inconsistent.
- Reuse one local eKYC action class/helper if many outline buttons receive identical classes; avoid modifying global primitive unless all app themes are audited.
- Preserve semantic `<label>` file picker or wrap it in a reusable button-like recipe; it cannot directly become a normal button without preserving input activation/accessibility.
- Preserve `video` overlays, preview aspect ratios, busy/disabled state, and responsive grids.

## Risk Notes

- Global theme correction is tempting but high blast radius: public, auth, admin, staff, and super-admin share/nest providers.
- Base UI `Button` normal foreground inheritance is fragile on mixed hard-coded light surfaces; local `text-zinc-900` should accompany explicit white backgrounds.
- Visual work must cover status/loading branches, otherwise completed or pending users still see the old card system.
- Validate at mobile width: action rows can overflow with long Vietnamese labels; footer controls may need wrapping/full-width behavior.
- `InfoPage` initializes form state from possibly undefined async profile data. This is unrelated to requested eKYC visual work and should not be folded into the same change unless observed as a user-facing bug.

## Recommended Validation

1. Compare `/profile/info` and every eKYC state at desktop and mobile widths.
2. Check document front/back, camera open/closed, upload busy, and disabled buttons.
3. Check selfie and liveness outline buttons for white background and zinc text/icon.
4. Check loading, approved, processing/pending, rejected/failed/cancelled states.
5. Verify keyboard focus visibility and camera/file-input activation.
6. Run `pnpm lint` and `pnpm build` in `frontend`.

## Unresolved Questions

- Should the entire customer `(main)` app be permanently light, or only profile/eKYC?
- Should primary eKYC CTAs match `/profile/info` black, or retain red as the brand action color?
- Is horizontal progress scrolling acceptable on mobile, or should it become a compact current-step indicator?

**Status:** DONE

**Summary:** Audited `/profile/info`, `/profile/ekyc`, shared profile shell, theme tokens, Button primitive, and all eKYC step controls. Found deterministic dark-theme token conflict behind camera/outline button rendering and documented low-risk alignment boundaries.

**Concerns/Blockers:** None blocking. Product decisions remain on light-theme scope, CTA color, and mobile progress treatment.
