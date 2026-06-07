# Project Roadmap

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
**Maintained By:** Development Team

## Current State

The repository has a functional backend and active frontend surfaces, but deployment ownership and infrastructure setup are still being established. The first priority is to stabilize local development, keep documentation current, and reduce production-readiness risks.

## Phase 1: Documentation and Local Development

- Keep `README.md` and `docs/` current as the source of truth.
- Maintain `docs/deployment-guide.md` with environment variables, Docker usage, and production notes.
- Document backend API endpoints and permission authorities.
- Clarify whether `migration` and `docker/docker-compose.yml` remain supported.
- Add `.env.example` files for backend and frontends.
- Add verified PostgreSQL local setup instructions.

## Phase 2: Backend Stabilization

- Externalize all secrets and local-only credentials from committed configuration.
- Replace `ddl-auto: update` for production with a controlled migration strategy.
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

- Define deployment topology and CI/CD.
- Add smoke tests and health checks.
- Add observability: structured logs, metrics, tracing, and alerting.
- Harden CORS, token lifetimes, rate limits, and file upload policies.
- Add backup/restore guidance for PostgreSQL and object/file uploads.

## Recommended Next Documents

- `docs/api-reference.md`
- `docs/security-permissions.md`
- `docs/testing-strategy.md`

## Open Questions

- Which environment is the target for production deployment?
- Which PostgreSQL provisioning path should be supported locally and in production?
- Are legacy MySQL and migration assets still active?
