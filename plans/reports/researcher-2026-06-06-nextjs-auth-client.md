# Research Report: Next.js Auth and API Client Review

**Date:** 2026-06-06
**Research Question:** What Next.js practices matter for this frontend review?

## Executive Summary

Current frontend should keep one API client and one token source. Next.js docs make browser-exposed env behavior explicit: only `NEXT_PUBLIC_` values are bundled client-side, and `.env` files should not be committed.

## Key Findings

### Environment variables

- Next.js supports `.env` loading, and browser-bundled variables must be prefixed with `NEXT_PUBLIC_`.
- Docs warn `.env` files should almost never be committed.
- Fit: frontend URL helpers should derive from one `NEXT_PUBLIC_API_URL` utility instead of hardcoded localhost.
- Source: https://nextjs.org/docs/15/app/guides/environment-variables

### Cookies

- Next.js App Router cookies API supports reading server-side cookies and route handlers can set cookies via response helpers.
- Fit: refresh-token cookie route is directionally right, but its GET endpoint returns the refresh token to client code, weakening httpOnly value.
- Source: https://nextjs.org/docs-wip/app/api-reference/functions/cookies

### Client/server boundaries

- Client components can use public env values and browser APIs; server-only secrets must stay server-side.
- Fit: keep refresh-token persistence in route handlers, not localStorage.

## Recommendations

1. **High:** remove `frontend/src/services/api.ts` or migrate its callers to `src/lib/http.ts`.
2. **High:** remove `GET /api/auth/refresh-token` or avoid returning raw refresh tokens.
3. **Medium:** create one `getApiBaseUrl()` / `getAssetUrl()` helper and replace hardcoded localhost.
4. **Medium:** fix frontend install/tooling so `pnpm lint` resolves `eslint`.

## Alternatives

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Single axios client | DRY, consistent auth | Migration effort | Best fit |
| Fetch wrappers | Native, simple | Bigger rewrite | Not now |
| LocalStorage tokens | Easy | XSS exposure, inconsistent | Avoid |
| httpOnly refresh + memory access token | Better security | Requires refresh flow care | Keep |

## Unresolved Questions

- Should backend refresh read token from cookie or request body?
- Should frontend run behind same domain as API in production?
