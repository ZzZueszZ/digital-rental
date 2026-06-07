# LensHub CMS

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
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

- PostgreSQL compose for `service/lenshub` is not currently present in `docker/`.
- `docker/docker-compose.yml` is a legacy MySQL CMS compose, not the active LensHub backend database setup.
- Production deployment target and secrets policy still need final owner decisions.
