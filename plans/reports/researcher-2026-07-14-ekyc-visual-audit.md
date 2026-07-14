# Research Report: eKYC Visual Audit

**Date:** 2026-07-14  
**Research Question:** How should `/profile/ekyc` match `/profile/info`, and which visual defects must be fixed?

## Executive Summary

Use `/profile/info` as visual shell: white `rounded-xl` card, subtle zinc-100 border, low shadow, 32–40 px desktop padding, Inter typography, zinc text, red accent. Keep eKYC-specific wizard/content, but remove its heavier `rounded-[24px]` + deep shadow treatment. Screenshot defect is reproducible from source: site defaults to `.dark`, while eKYC outline buttons use token `bg-background`; inside an explicitly light profile card this becomes black and can leave icon/text nearly invisible.

## Evidence and Limitations

- Production `/profile/info` and `/profile/ekyc`, Chrome 1827×1079: both remained at full-page `Đang tải thông tin tài khoản...`; rendered authenticated cards unavailable. HTML had class `dark`, `--background` resolved near black, while body was explicitly white.
- User screenshot, 945×129 crop: upload control renders white and legible; adjacent `Mở camera` button renders black with black/near-black content.
- Local source is strongest implementation evidence: profile info uses explicit light utilities; eKYC outline buttons inherit theme tokens; global provider defaults dark.
- Responsive findings below derive from Tailwind classes/source, not a fully rendered production session, because profile API loading blocked both routes.

## Key Findings

### 1. Shell mismatch

`/profile/info` root: white, `rounded-xl`, zinc-100 border, `p-8 md:p-10`, subtle `0 2px 6px` shadow, entry animation. eKYC root: `rounded-[24px]`, zinc-200 border, `0 20px 70px` shadow, divided header/body. Result: eKYC appears like a separate product flow rather than another profile page.

### 2. Camera button root cause

- Upload is a plain label with explicit `bg-white` and zinc border.
- `Mở camera` is shared `Button variant="outline"` with no explicit light text/background.
- Outline variant uses `bg-background`; global theme defaults to dark and production HTML was `.dark`.
- Therefore `bg-background` becomes near-black inside a white-only profile UI. Screenshot matches this failure exactly.
- Same risk applies to every eKYC outline action: `Đóng camera`, `Quay lại`, `Quay lại video`, `Chụp lại`, etc.

### 3. Typography and spacing drift

- Both routes use Inter and 24 px top title, but info subtitle is medium weight and card begins with a single header block.
- eKYC adds a second 20 px step heading and large header divider; acceptable functionally, but vertical hierarchy feels heavier.
- eKYC desktop inner padding 32 px is close to info, but outer radius/shadow/border make the mismatch dominant.

### 4. Responsive risks

- Progress uses fixed `min-w-[680px]` inside horizontal scroll. Functional, but labels may start off-screen on 375 px and scroll affordance is weak.
- Document actions correctly switch from one column to two at `sm`; camera/content switches to two columns at `lg`.
- Footer uses horizontal `justify-between`; long Vietnamese CTA can squeeze or overflow at 320–375 px.
- Info uses 32 px padding even below `md`; blindly copying that mobile padding would reduce usable eKYC capture width.

## Ranked Recommendations

1. **Force the profile customer surface to light mode or make eKYC controls explicitly light-safe.**
   - Preferred: route-level light theme for all `/profile/*`, because those pages already hard-code white/zinc styling.
   - Immediate safety: all eKYC outline controls use explicit `bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950`; icons inherit current color.
   - Risk: route-level theme changes can affect popovers/toasts; verify every profile route.

2. **Adopt info card shell, retain eKYC workflow internals.**
   - Root target: `rounded-xl border border-zinc-100 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]`.
   - Padding target: `p-5 sm:p-8 md:p-10`; mobile exception keeps capture usable.
   - Remove deep floating shadow and 24 px radius. Keep header divider only if progress separation remains useful.

3. **Normalize component states and responsive actions.**
   - Standard control height 44 px for upload/camera/capture; radius 12 px; icon 16 px; text 14 px medium/semibold.
   - Stack footer actions full-width below `sm`; align right and intrinsic width from `sm` upward.
   - Keep capture preview full-width; no page-level horizontal overflow.

## Actionable Visual Acceptance Criteria

### Desktop (≥1024 px)

- eKYC content aligns with the same profile main-column edges as info; no width jump when navigating between routes.
- Root card matches info: white background, 12 px radius, zinc-100 1 px border, subtle low shadow; no 24 px radius/deep shadow.
- Card padding 32–40 px; header-to-progress 24–28 px; progress-to-step content 28–32 px.
- Page title: Inter 24 px/semibold/zinc-950. Subtitle: 14 px, zinc-500, max width about 672 px.
- Step title: 20 px/semibold/zinc-950; helper: 14 px/zinc-500/line-height about 24 px.
- Document preview and guidance remain two columns at `lg`, gap 24 px; right guidance width about 330 px.

### Buttons and states

- `Chọn ảnh từ máy` and `Mở camera` are equal height (44 px), equal radius (12 px), equal width within the two-column row.
- Default outline: white background, zinc-300 border, zinc-700/900 content; camera icon and label clearly visible. Never black-on-black.
- Outline hover: zinc-50 background, zinc-950 text. Focus: visible ring/border. Active: no layout shift beyond existing subtle press.
- Primary CTA: consistent brand red (`red-600`, hover `red-700`) with white text unless product decision intentionally adopts info's zinc-950 CTA; choose one style for the full eKYC flow.
- Disabled: opacity reduction remains readable; cursor/action unavailable; loading spinner does not change button width.
- Camera permission/error state gives visible Vietnamese feedback and leaves retry/upload alternatives usable.

### Mobile (320–767 px)

- Root uses 16–20 px padding; preview retains full available width; no body horizontal scrollbar.
- Upload/camera actions stack at 320–575 px and become two columns at `sm`; each is at least 44 px tall.
- Bottom navigation stacks or wraps without truncating `Trích xuất thông tin & tiếp tục`; primary action appears first visually or full-width below secondary.
- Progress may scroll horizontally, but current step is visible on entry and container has an affordance (edge fade or concise mobile step label). Page itself must not scroll horizontally.
- Text does not clip at 200% browser zoom; camera controls remain reachable with on-screen browser chrome.

### Cross-route regression

- Navigating info → eKYC preserves sidebar, header, background, content alignment, card radius, border tone, typography, and perceived elevation.
- Test light, saved dark, and system-dark preference. Profile remains intentional light UI, or every token-driven component has sufficient contrast.
- Verify all eKYC steps and statuses: front, back, selfie, liveness, review, loading, processing, approved, rejected/failed/cancelled.

## Alternatives Considered

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Route-level light theme for `/profile/*` | Fixes all token primitives coherently; matches existing white UI | Must regression-test overlays and all profile routes | **Preferred** |
| Add explicit light classes only to eKYC buttons | Small, low-risk patch | Repeated classes; future token components can regress | **Immediate fallback** |
| Change global default theme to light | Broadly fixes customer pages | Large unrelated impact; admin/theme behavior risk | Not in this task |
| Make full profile UI dark-compatible | True theme support | High scope, conflicts with request to match info | Reject/YAGNI |

## Sources

1. [Production profile info](https://www.lenshub.shop/profile/info) — live shell/loading and theme observation.
2. [Production profile eKYC](https://www.lenshub.shop/profile/ekyc) — live shell/loading and theme observation.
3. User-provided screenshot `codex-clipboard-16c8b97f-0d3e-4b35-8a61-29618b0f1c02.png` — direct defect evidence.
4. `frontend/src/app/(main)/profile/info/page.tsx` — reference card, spacing, control treatment.
5. `frontend/src/app/(main)/profile/ekyc/page.tsx` and route-local components — current wizard/layout/responsive behavior.
6. `frontend/src/components/ui/button.tsx`, `frontend/src/providers/theme-provider.tsx`, `frontend/src/styles/globals.css` — theme/button root cause.
7. `docs/design-guidelines.md` — project tokens, Inter, radius, accessibility guidance.

## Next Steps

1. Implement route light-safety and info-aligned shell.
2. Audit every outline button across all five steps/status views.
3. Validate 320, 375, 768, 1024, 1440 px; light/system-dark/saved-dark; keyboard focus; 200% zoom.
4. Recheck production after profile API/session loads normally.

## Unresolved Questions

- Should primary eKYC CTA remain brand red or exactly match info's zinc-950 `Lưu hồ sơ` button?
- Should the desktop five-step progress remain horizontal on mobile, or become `Bước X/5` plus compact progress bar?
- Production profile loading hang may be session/API-specific; separate debugging recommended if reproducible for users.
