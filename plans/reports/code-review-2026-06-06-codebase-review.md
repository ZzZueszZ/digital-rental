# Code Review Report: Codebase Review

**Date:** 2026-06-06
**Scope:** `service/lenshub`, `frontend`, Docker/config/docs
**Validation:** `service/lenshub/gradlew test` passed. `frontend/pnpm lint` failed to start because `eslint` was not found by the script.

## Overall Assessment

Core layering is understandable and the backend permission model is explicit. Main blockers are production readiness and auth/config consistency, not architecture complexity.

## Critical Issues

1. **Committed secrets and unsafe default secrets**
   - Evidence: `service/lenshub/src/main/resources/application.yml:26-27`, `:36-38`, `:72`, `:78`.
   - Impact: exposed Gmail app password, DB password, JWT fallback secret, activation secret.
   - Fix: rotate exposed credentials; replace defaults with env-required values or dev-only profile.

2. **Production-unsafe DB/log settings**
   - Evidence: `application.yml:52-68`.
   - Impact: schema drift/data loss risk, sensitive SQL parameter logging.
   - Fix: prod `ddl-auto=validate|none`, disable SQL/binder trace, use Flyway/Liquibase.

## High Priority Findings

1. **Upload URL/delete mismatch**
   - Evidence: `FileUploadUtil.java:40` returns `/api/uploads/...`; `WebConfig.java:31` serves `/uploads/**`; `FileUploadUtil.java:49-50` deletes from `api/uploads`.
   - Impact: deleted/replaced images likely remain on disk; URLs may not resolve consistently.
   - Fix: normalize stored URL prefix and filesystem path; guard delete path under upload root.

2. **Duplicate CORS config hardcoded to localhost**
   - Evidence: `SecurityConfig.java:70-79`; `WebConfig.java:15-20`.
   - Impact: prod frontend blocked or CORS behavior differs depending on path/filter order.
   - Fix: one CORS config source from `app.cors.allowed-origins`.

3. **VNPay redirect hardcoded and leaks exception messages**
   - Evidence: `VnPayPaymentController.java:49`, `:58-60`.
   - Impact: prod redirect wrong; user-visible query can expose internal error text.
   - Fix: configure frontend return URL; map failures to safe codes/messages.

4. **Frontend has two auth clients and token sources**
   - Evidence: `frontend/src/lib/http.ts:13-20`; `frontend/src/services/api.ts:3-13`; callers in `ProductListSection.tsx` and product detail use `api`.
   - Impact: some requests ignore Zustand/refresh flow and read `localStorage auth-token`.
   - Fix: migrate all callers to `http`; delete `services/api.ts`.

## Medium Priority Findings

1. **Hardcoded asset/API origins in frontend**
   - Evidence: `LowStockCard.tsx:23`, `products/[id]/page.tsx:127-128`, `userConfig.ts:48`.
   - Impact: broken images outside localhost.
   - Fix: shared asset URL helper based on `NEXT_PUBLIC_API_URL`.

2. **httpOnly refresh token can be returned to client**
   - Evidence: `frontend/src/app/api/auth/refresh-token/route.ts:41-49`.
   - Impact: weakens purpose of httpOnly cookie if client code can fetch it.
   - Fix: remove GET or return boolean/session status only.

3. **Frontend lint tooling broken**
   - Evidence: `pnpm lint` and `pnpm exec eslint --version` cannot resolve `eslint`.
   - Impact: no reliable frontend static validation.
   - Fix: reinstall dependencies with project package manager; verify `.bin/eslint`.

## Positive Observations

- Backend tests pass.
- Controllers consistently use `@PreAuthorize` for sensitive operations.
- `ApiResponse<T>` gives a consistent response envelope.
- Next frontend already has a stronger `http` client with refresh queue and loading integration.

## Recommended Actions

1. Rotate secrets and split `application-local.yml` / `application-prod.yml`.
2. Fix upload URL/path handling and add tests around save/replace/delete.
3. Centralize CORS and public frontend URL config.
4. Unify frontend API calls on `src/lib/http.ts`.
5. Replace hardcoded localhost helpers.
6. Repair frontend dependency install and run lint/build.

## Unresolved Questions

- Which legacy deleted modules should stay deleted?
- Is VNPay return route expected to be public only for browser redirects, or also IPN/webhook?
