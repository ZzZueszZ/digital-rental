# LensHub CMS

## Documentation Maintenance
**Last Updated:** 2026-06-28
**Document Version:** 1.2
**Maintained By:** Development Team

LensHub is a camera equipment ecommerce and rental platform. This repository contains the main Spring Boot API, Next.js frontend, and supporting infrastructure/docs.

## Project Structure

```text
.
+-- service/lenshub/      # Spring Boot backend API
+-- frontend/             # Next.js frontend
+-- docs/                 # Project source-of-truth documentation
+-- deploy/               # Deployment support assets
+-- docker/               # Legacy/local compose assets
+-- migration/            # Legacy migration assets
+-- plans/                # Planning and agent reports
```

## Main Apps

- Backend: Java 17, Spring Boot 4, Gradle, PostgreSQL, Redis, JWT auth, VNPay, SMTP mail.
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn-style UI, TanStack Query, Zustand, axios.

## Local Commands

Backend:

```powershell
cd service/lenshub
.\gradlew bootRun
.\gradlew test
```

Frontend:

```powershell
cd frontend
pnpm install
pnpm dev
pnpm lint
pnpm build
```

Default backend URL is `http://localhost:8080/api`. Frontend API URL is controlled by `NEXT_PUBLIC_API_URL`.

## Documentation

Read these first:

- `docs/project-overview-pdr.md`
- `docs/codebase-summary.md`
- `docs/code-standards.md`
- `docs/system-architecture.md`
- `docs/deployment-guide.md`
- `docs/project-roadmap.md`
- `docs/design-guidelines.md`

## Known Setup Gaps

- `docker/docker-compose.yml` provides the local PostgreSQL, Redis, and MinIO stack; it is not production-ready.
- Production Phase 01 is complete: Flyway, health probes, production secret validation, and FPT provider configuration.
- Production Phase 02 is complete with deferred validation: the backend has a pinned, non-root, health-checked `linux/amd64` image.
- Production Compose, edge/TLS, CI/CD, backup, monitoring, and deferred container release checks remain under `plans/2026-06-28-production-deployment/`.
