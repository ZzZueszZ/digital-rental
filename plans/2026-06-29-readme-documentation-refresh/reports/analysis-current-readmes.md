# Analysis Report: Current README State

**Date:** 2026-06-29

## Scope

- `README.md`
- `frontend/README.md`
- `service/lenshub/README.md`
- `service/ai-kyc-service/README.md`

## Findings

- Root README exists but is brief. It names core apps and docs but lacks end-to-end onboarding.
- `frontend/README.md` is still create-next-app boilerplate and points readers to generic Next.js docs instead of LensHub routes/env/scripts.
- `service/lenshub/README.md` is missing, despite backend being primary API.
- `service/ai-kyc-service/README.md` has valuable local instructions, but rendered text is corrupted in current shell output and includes stale absolute paths from a different workspace.

## Project Facts To Preserve

- Root product: camera ecommerce/rental platform with backend, frontend, AI KYC service, infra/docs.
- Backend: Java 17, Spring Boot 4, Gradle, PostgreSQL, Redis, MinIO, Flyway, JWT, VNPay, FPT KYC, Docker image.
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Zustand, shadcn-style UI.
- AI KYC: FastAPI service exposing FPT-compatible OCR, face match, liveness, and health endpoints.

## Risks

- README may expose env secrets if copied from local `.env`.
- README may drift from docs if it repeats too much architecture detail.
- AI KYC README rewrite can accidentally remove nuanced model setup notes.

## Recommended Scope

Only update:

- `README.md`
- `frontend/README.md`
- `service/lenshub/README.md`
- `service/ai-kyc-service/README.md`
- optional plan/report docs.

## Unresolved Questions

- None.
