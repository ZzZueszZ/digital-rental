# Design Guidelines

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
**Maintained By:** Development Team

## Design Systems

The repository currently has one active frontend design system.

| App | Design System | Primary Use |
| --- | --- | --- |
| `frontend` | shadcn/ui, Tailwind CSS, lucide-react, custom CSS variables | Current ecommerce/customer/admin app. |

Keep new `frontend` screens aligned with shadcn/Tailwind.

## `frontend` Tokens

Verified in `frontend/src/styles/globals.css` and `frontend/components.json`.

### Colors

| Token | Value |
| --- | --- |
| `--background` | `oklch(1 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` |
| `--card` | `oklch(1 0 0)` |
| `--popover` | `oklch(1 0 0)` |
| `--primary` | `oklch(0.6 0.2 25)` |
| `--primary-foreground` | `oklch(0.985 0 0)` |
| `--secondary` | `oklch(0.97 0 0)` |
| `--muted` | `oklch(0.97 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` |
| `--accent` | `oklch(0.97 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` |
| `--border` | `oklch(0.922 0 0)` |
| `--input` | `oklch(0.922 0 0)` |
| `--ring` | `oklch(0.708 0 0)` |

### Typography

- Font: Inter via `next/font/google`.
- Body class: `font-sans antialiased`.
- Heading token maps to Inter in current CSS.

### Radius

- Base radius: `--radius: 0.625rem`.
- Tailwind theme radius tokens:
  - `--radius-sm: 8px`
  - `--radius-md: 12px`
  - `--radius-lg: 16px`
- Dashboard radius tokens:
  - `--radius-dash-sm: 8px`
  - `--radius-dash-md: 12px`
  - `--radius-dash-lg: 16px`

### Dashboard Layout Tokens

| Token | Value |
| --- | --- |
| `--dash-sidebar-w` | `240px` |
| `--dash-navbar-h` | `60px` |
| `--dash-row-h` | `48px` |
| `--spacing-dash-gap` | `1.25rem` |
| `--spacing-dash-card-p` | `1rem` |
| `--spacing-dash-card-p-lg` | `1.25rem` |

### Components

Reusable components live in `frontend/src/components/ui`:

- Buttons, badges, cards, dialogs, drawers, dropdown menus, inputs, labels, navigation menus, scroll areas, selects, separators, sheets, skeletons, switches, tables, tabs, avatars, carousel, toaster.

Feature components live near their use:

- Auth: `frontend/src/components/auth`
- Layout: `frontend/src/components/layout`
- Admin products/users/categories: route-local components under `frontend/src/app/(admin)/admin/...`

### Interaction States

- Use existing shadcn component variants where possible.
- Keep loading behavior coordinated with `LoadingOverlay` and TanStack Query states.
- Use `sonner` for toast notifications.
- Use lucide-react icons for common actions.

## Layout Guidance

- `frontend`: use App Router layouts and route groups. Prefer dense admin screens for management workflows and more visual product layouts for customer browsing.
- Keep forms explicit, with validation messages close to the input.
- Keep destructive actions behind confirmation dialogs.

## Accessibility

- Use semantic buttons and links.
- Ensure focus states remain visible through `--ring`.
- Keep color contrast sufficient for red primary actions on white backgrounds.
- Do not rely only on color for status; pair color with text or icons.

## Open Questions

- Whether the red `frontend` primary color is final brand direction.
