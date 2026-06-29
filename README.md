# LensHub Digital Rental

## Documentation Maintenance

**Last Updated:** 2026-06-29
**Document Version:** 2.0
**Maintained By:** Development Team

LensHub is a camera equipment ecommerce and rental platform. This monorepo contains the Spring Boot API, Next.js web app, optional self-hosted AI KYC service, deployment assets, and source-of-truth project documentation.

## Projects

| Path | Purpose | README |
| --- | --- | --- |
| `service/lenshub` | Primary Spring Boot API for catalog, auth, orders, rentals, payments, eKYC, admin workflows, files, mail, and storage. | [service/lenshub/README.md](service/lenshub/README.md) |
| `frontend` | Next.js customer/admin/staff web app. | [frontend/README.md](frontend/README.md) |
| `service/ai-kyc-service` | Optional FastAPI service with FPT-compatible OCR, face match, and liveness endpoints for local/self-hosted KYC work. | [service/ai-kyc-service/README.md](service/ai-kyc-service/README.md) |
| `docker` | Local and production Compose assets. | See [docs/deployment-guide.md](docs/deployment-guide.md) |
| `docs` | Product, architecture, deployment, standards, roadmap, and design source of truth. | See [Documentation](#documentation) |
| `plans` | Implementation plans and agent reports. | Internal workflow artifacts |

## Stack

- Backend: Java 17, Spring Boot 4, Gradle, PostgreSQL, Redis, Flyway, JWT, VNPay, MinIO, FPT KYC, Resend/SMTP mail.
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Zustand, axios, shadcn-style UI.
- AI KYC: Python, FastAPI, PaddleOCR, InsightFace, ONNX Runtime, MediaPipe.
- Infrastructure: Docker Compose for local PostgreSQL, Redis, and MinIO; production backend Docker image and Compose assets.

## Quick Start

From the repository root:

```powershell
docker compose -f docker/docker-compose.dev.yml up -d
```

Run the backend:

```powershell
cd service/lenshub
Copy-Item .env.example .env
.\gradlew bootRun
```

Run the frontend in another terminal:

```powershell
cd frontend
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Optional local AI KYC provider:

```powershell
cd service/ai-kyc-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Local URLs

| Service | URL |
| --- | --- |
| Backend API | `http://localhost:8080/api` |
| Backend health | `http://localhost:8080/api/actuator/health` |
| Frontend dev server | `http://localhost:3000` |
| MinIO API | `http://localhost:9000` |
| MinIO Console | `http://localhost:9001` |
| AI KYC health | `http://localhost:8000/health` |

## Common Commands

Backend:

```powershell
cd service/lenshub
.\gradlew bootRun
.\gradlew test
docker build -t lenshub-backend:local .
```

Frontend:

```powershell
cd frontend
pnpm dev
pnpm lint
pnpm build
```

AI KYC:

```powershell
cd service/ai-kyc-service
python -m pytest
docker compose up --build
```

## Environment Files

Use example files as templates. Do not commit real secrets.

- Backend: `service/lenshub/.env.example`
- Frontend: `frontend/.env.example`
- AI KYC: uses `KYC_AI_*` environment variables; see [service/ai-kyc-service/README.md](service/ai-kyc-service/README.md)
- Production compose expects `docker/backend.prod.env`, which is intentionally not committed.

## Documentation

Read these when changing behavior or deployment:

- [Project overview and PDR](docs/project-overview-pdr.md)
- [Codebase summary](docs/codebase-summary.md)
- [Code standards](docs/code-standards.md)
- [System architecture](docs/system-architecture.md)
- [Deployment guide](docs/deployment-guide.md)
- [Project roadmap](docs/project-roadmap.md)
- [Design guidelines](docs/design-guidelines.md)

## Production Notes

- Production backend image is built from `service/lenshub/Dockerfile`.
- Production profile is fail-fast for unsafe secrets and endpoints.
- Production Compose lives at `docker/docker-compose.prod.yml`.
- Do not store real keys, passwords, or provider credentials in this repository.

## Known Gaps

- Full production edge/TLS, backup, monitoring, and CI/CD rollout remain tracked under `plans/2026-06-28-production-deployment/`.
- `migration/` contains legacy migration assets; current backend ownership is under Flyway migrations in `service/lenshub/src/main/resources/db/migration`.
