# LensHub Frontend

## Documentation Maintenance

**Last Updated:** 2026-06-29
**Document Version:** 2.0
**Maintained By:** Development Team

`frontend` is the LensHub web application. It serves public shopping pages, customer account flows, eKYC, checkout, rental workflows, and role-specific admin/staff screens.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn-style components in `src/components/ui`
- TanStack Query for server state
- Zustand for auth/loading state
- axios HTTP client in `src/lib/http.ts`

## App Structure

```text
src/app/
+-- (main)/        # public and customer pages
+-- (auth)/        # login, register, activation, password reset, Google callback
+-- (admin)/       # admin dashboard and management screens
+-- (staff)/       # staff entry screens
+-- (super-admin)/ # super admin entry screens
+-- api/           # Next.js route handlers if needed
src/components/    # shared and feature components
src/services/      # backend API service modules
src/store/         # Zustand stores
src/lib/           # HTTP client and shared utilities
```

## Prerequisites

- Node.js compatible with Next.js 16
- pnpm
- Running backend API, local or deployed

## Environment

Create a local env file from the template:

```powershell
Copy-Item .env.example .env
```

Important variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL, usually `http://localhost:8080/api` for local development. |
| `NEXT_PUBLIC_E2EE_ENABLED` | Enables frontend E2EE request support. Must match backend config. |
| `NEXT_PUBLIC_SERVER_JWK_X` / `NEXT_PUBLIC_SERVER_JWK_Y` | Backend server public key coordinates for E2EE. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID. |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | Google OAuth redirect URI. |

Use placeholders in committed files. Keep real values in local or deployment secrets.

## Install

```powershell
pnpm install
```

## Run

```powershell
pnpm dev
```

Default dev URL:

```text
http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start local Next.js dev server. |
| `pnpm build` | Build production frontend. |
| `pnpm start` | Start built app. |
| `pnpm lint` | Run ESLint. |
| `pnpm verify:e2ee` | Verify E2EE handshake behavior with the configured backend. |

## Backend Integration

API calls should go through:

- `src/lib/http.ts` for shared axios behavior, token injection, refresh queue, and loading state.
- `src/services/*.ts` for feature-specific API calls.

The backend API is mounted at `/api`; set `NEXT_PUBLIC_API_URL` to the full base URL.

## UI Conventions

- Reuse primitives from `src/components/ui`.
- Keep page-specific components near the route that owns them.
- Use lucide-react icons where a common icon exists.
- Follow [../docs/design-guidelines.md](../docs/design-guidelines.md) and [../docs/code-standards.md](../docs/code-standards.md).

## Validation

Run before merging frontend changes:

```powershell
pnpm lint
pnpm build
```

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API calls hit production unexpectedly | Check `NEXT_PUBLIC_API_URL` in `.env`. |
| Auth refresh loops | Confirm backend auth endpoints are reachable and tokens are valid. |
| E2EE requests fail | Ensure frontend E2EE flag and server JWK values match backend identity config. |
| Google login fails | Check OAuth client ID and redirect URI. |
