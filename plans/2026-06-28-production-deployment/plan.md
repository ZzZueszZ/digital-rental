# Implementation Plan: LensHub Production Deployment

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** In Progress
**Complexity:** High
**Estimated Effort:** 6-9 engineer days

## Outcome

Deploy LensHub backend, PostgreSQL, Redis, and private MinIO on one 4 GB/80 GB VPS. Frontend remains on Vercel. FPT.AI provides eKYC. GitHub Actions builds an immutable backend image, pushes GHCR, and makes VPS pull/deploy with health-gated rollback.

## Locked Architecture

- `www.lenshub.shop`: Vercel frontend.
- `api.lenshub.shop`: NGINX TLS → Spring Boot `/api`.
- `storage.lenshub.shop`: NGINX TLS → MinIO S3 API.
- PostgreSQL/Redis private Docker network; MinIO bucket private.
- MinIO Console private through SSH tunnel.
- Registry: private GHCR, deploy by image digest.
- Backup: encrypted Cloudflare R2; RPO 24h, RTO 4h.
- No `ai-kyc-service`, Kubernetes, Swarm, Watchtower, or second backend replica.

## Phases

| Phase | Scope | Depends on | Status |
| --- | --- | --- | --- |
| [01](phase-01-production-safety.md) | Secrets, config, Flyway baseline, health contract | approval | DONE (2026-06-28) |
| [02](phase-02-backend-container.md) | Reproducible backend image and runtime limits | 01 | DONE_WITH_CONCERNS (2026-06-28) |
| [03](phase-03-vps-infrastructure.md) | VPS hardening and production Compose | 02 | Pending |
| [04](phase-04-edge-minio-tls.md) | DNS, NGINX, TLS, public S3 API | 03 | Pending |
| [05](phase-05-ci-ghcr.md) | CI tests and GHCR image publishing | 02 | In Progress |
| [06](phase-06-cd-deploy-rollback.md) | Pull deployment, smoke checks, rollback | 03, 04, 05 | Pending |
| [07](phase-07-backup-monitoring-go-live.md) | R2 backup, restore, monitoring, docs, go-live | 06 | Pending |

## Dependency Graph

```text
01 -> 02 -> 03 -> 04 --\
          `----> 05 ----> 06 -> 07
```

## Success Metrics

- Only SSH/HTTP/HTTPS public; DB, Redis, backend, MinIO ports not Internet-exposed.
- Backend deploys from exact GHCR digest and becomes healthy within 120 seconds.
- Failed release automatically restores previous healthy digest.
- Browser uploads through `storage.lenshub.shop` from production Vercel origin.
- FPT OCR, facematch, liveness work without local AI container.
- Daily backups complete; monthly restore meets RPO 24h/RTO 4h.
- VPS remains below 80% RAM and 70% disk during normal workload.

## Validation Matrix

| Layer | Required validation |
| --- | --- |
| Unit/build | Backend tests, frontend lint/build, container non-root/secret scan |
| Integration | PostgreSQL migration, Redis, MinIO presign/CORS, FPT sandbox |
| Deployment | Health timeout, bad-image rollback, concurrent-run lock |
| E2E | Auth, upload/download, eKYC, VNPay return/IPN, email |
| Recovery | PostgreSQL restore, MinIO checksum sample, full rebuild drill |

## Research

- [Production deployment research](research/researcher-production-deployment.md)
- [Current readiness analysis](reports/analysis-current-production-readiness.md)

## Approval Gate

Do not implement until user approves this draft. After approval execute `/code plans/2026-06-28-production-deployment/plan.md`.

## Unresolved Questions

- Confirm creation of `api.lenshub.shop` and `storage.lenshub.shop`.
- Confirm whether production PostgreSQL contains data before first release.
- Confirm VPS OS and SSH user.
