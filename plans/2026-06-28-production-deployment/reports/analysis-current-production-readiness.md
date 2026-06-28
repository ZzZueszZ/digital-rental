# Analysis: Current Production Readiness

**Date:** 2026-06-28

## Verified State

- Backend: Java 17, Spring Boot 4.0.3, context path `/api`.
- Frontend: Next.js 16 already hosted at `https://www.lenshub.shop/`.
- PostgreSQL, Redis, MinIO development services exist in `docker/docker-compose.yml`.
- Private file metadata and presigned MinIO PUT/GET flow implemented.
- FPT provider implemented; local AI provider optional.
- Production CORS variables already supported.
- Redis host, port, password already environment-driven.

## Gaps Blocking PROD

- No backend Dockerfile or production Compose stack.
- No `.github/workflows` CI/CD.
- No Spring Actuator/production health endpoint.
- No Flyway/Liquibase migrations; default `ddl-auto=update`.
- Unsafe MinIO credential defaults committed in `application.yml`.
- Development Compose exposes PostgreSQL, Redis, MinIO ports publicly.
- MinIO CORS currently hardcoded only for one origin in init command.
- No NGINX production config, TLS automation, backup, restore, monitoring, or rollback scripts.
- Deployment docs drift: claim PostgreSQL Compose absent and Redis hardcoded.

## Runtime Topology

```text
Vercel www.lenshub.shop
  |-- HTTPS API --> api.lenshub.shop:443 --> NGINX --> 127.0.0.1:8080 --> backend
  `-- Presigned S3 --> storage.lenshub.shop:443 --> NGINX --> 127.0.0.1:9000 --> MinIO

backend Docker network:
  PostgreSQL 5432, Redis 6379, MinIO 9000

backend outbound:
  FPT.AI, VNPay, SMTP
```

## Capacity Guardrails

| Component | Budget |
| --- | ---: |
| Spring JVM | 768 MiB heap, 1 GiB container |
| PostgreSQL | 640 MiB container |
| MinIO | 512 MiB container |
| Redis | 192 MiB, `noeviction` |
| OS, Docker, NGINX | about 1 GiB |
| Emergency headroom | at least 500 MiB |

- Add 2 GiB swap as OOM guard, not capacity.
- Docker JSON log rotation: `10m`, 3 files.
- Disk warning 70%, critical 85%.
- Keep only current and previous backend images locally.

## Data and Failure Flows

- Upload: browser requests presign → browser PUT to public MinIO endpoint → backend completes asset.
- eKYC: backend resolves private asset → temporary file → FPT API → result PostgreSQL → temp cleanup.
- Payment: backend creates VNPay URL → browser VNPay → public return/IPN endpoint.
- Deploy: CI tests → GHCR image+digest → VPS pull → backend replace → health/smoke → record success or rollback.
- Backup: PostgreSQL dump and MinIO object sync → client-side encrypted R2 → periodic restore drill.

## File Ownership by Phase

| Phase | Exclusive ownership |
| --- | --- |
| 01 | Spring config, security health allowlist, Gradle dependencies, Flyway files |
| 02 | Backend Dockerfile and `.dockerignore` |
| 03 | Production Compose, VPS bootstrap and capacity scripts |
| 04 | NGINX/TLS configs, MinIO edge settings, frontend storage hostname config |
| 05 | CI and initial production build/publish workflow |
| 06 | CD portion of production workflow, deploy/smoke/rollback scripts |
| 07 | Backup/monitoring assets and project documentation |

Phases 05 and 06 intentionally touch `production.yml` sequentially, never in parallel.

## Main Risks

| Risk | Level | Mitigation |
| --- | --- | --- |
| Single VPS failure | High | encrypted offsite backup, documented rebuild |
| 80 GB exhausted by KYC video | High | alerts, object reports, future lifecycle decision |
| Raw IP MinIO over HTTP | High | DNS + TLS reverse proxy |
| `ddl-auto=update` corrupts drift | High | Flyway baseline + `validate` |
| App rollback after breaking migration | High | expand/contract migrations |
| Backup exists but cannot restore | High | monthly automated restore drill |
| Public MinIO credentials leaked | High | private bucket, scoped keys, root key never used by tools |

## Unresolved Questions

- Existing production data state.
- DNS update access.
- Exact VPS OS, public IP, SSH user.
