# Project Roadmap

## Documentation Maintenance
**Last Updated:** 2026-06-28
**Document Version:** 1.2
**Maintained By:** Development Team

## Current State

The repository has a functional backend and Next.js frontend on Vercel. Production deployment work follows `plans/2026-06-28-production-deployment/`; Phases 01 and 02 of 7 are implemented.

## Phase 1: Documentation and Local Development

- Completed 2026-06-26: private local MinIO infrastructure with bucket bootstrap, restrictive CORS, and backend endpoint configuration. Application upload migration remains pending.
- Keep `README.md` and `docs/` current as the source of truth.
- Maintain `docs/deployment-guide.md` with environment variables, Docker usage, and production notes.
- Document backend API endpoints and permission authorities.
- Clarify whether `migration` and `docker/docker-compose.yml` remain supported.
- Add `.env.example` files for backend and frontends.
- Add verified PostgreSQL local setup instructions.

## Phase 2: Backend Stabilization

- Completed 2026-06-26: private MinIO storage core with authenticated presigned upload/download APIs and server-side asset metadata validation. eKYC/product migration remains pending.
- Completed 2026-06-28: removed committed MinIO credential defaults; production validator now rejects missing/unsafe secrets and endpoints.
- Completed 2026-06-28: added Flyway V1 baseline and production Hibernate `ddl-auto: validate`.
- Completed 2026-06-28: separated access-token and activation-token signing secrets.
- Add integration tests for auth, product, order, payment, voucher, and inventory flows.
- Standardize validation and error messages across DTOs and `GlobalExceptionHandler`.
- Review Redis usage and token blacklist lifecycle.

## Phase 3: Frontend Stabilization

- Keep API client and auth refresh behavior consistent across frontend services.
- Add route-level access control documentation and tests.
- Expand admin flows for products, orders, users, vouchers, inventory, support, and audit logs as needed.
- Standardize empty, loading, error, and permission-denied states.

## Phase 4: Product Capability

- Complete or verify rental-specific behavior: rental periods, availability, deposits, late fees, return handling, damage assessment, and device lifecycle.
- Complete or verify identity/KYC workflows: OCR preview, facematch, liveness video validation, risk assessment, admin approval/rejection, and customer status handling.
- Improve dashboard analytics for revenue, product utilization, inventory health, and order lifecycle.
- Add notification flows for activation, reset, order status, voucher expiry, and low stock.

## Phase 5: Production Readiness

- Target topology and CI/CD plan defined: Vercel frontend, single VPS Compose stack, NGINX, GHCR digest deployment, Cloudflare R2 backup.
- Completed 2026-06-28: Actuator health/liveness/readiness contract; detailed component health remains authenticated.
- Completed with deferred validation 2026-06-28: pinned multi-stage `linux/amd64` backend image, non-root runtime, bounded JVM heap, and readiness healthcheck.
- Release gate: run dependency startup, healthy-transition, memory/read-only-filesystem, cache, final contract-test, and CVE checks in Phase 03 or CI.
- Next: production Compose with PostgreSQL, Redis, MinIO, backend resource limits, volumes, and private networking.
- Later: DNS/TLS, GHCR CI/CD, backup/restore, monitoring.
- Add observability: structured logs, metrics, tracing, and alerting.
- Harden CORS, token lifetimes, rate limits, and file upload policies.
- Add backup/restore guidance for PostgreSQL and object/file uploads.

## Recommended Next Documents

- `docs/api-reference.md`
- `docs/security-permissions.md`
- `docs/testing-strategy.md`

## Open Questions

- Whether the first production PostgreSQL database is empty or requires explicit Flyway baseline.
- VPS OS version and SSH deploy user.
- Final container runtime and vulnerability checks deferred from Phase 02.
- Are legacy MySQL and migration assets still active?
