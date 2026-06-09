# Deployment Guide

## Documentation Maintenance
**Last Updated:** 2026-06-09  
**Document Version:** 1.0  
**Maintained By:** Development Team

## Scope

This guide documents what is verified in the repository today. It is not a production runbook yet because deployment target, secret storage, and database migration policy are unresolved.

## Runtime Components

| Component | Path | Runtime |
| --- | --- | --- |
| Backend API | `service/lenshub` | Java 17, Spring Boot 4, Gradle |
| Frontend | `frontend` | Node.js, pnpm, Next.js 16 |
| Database | external | PostgreSQL expected by `application.yml` |
| Cache | external | Redis expected by `application.yml` |
| Payments | external | VNPay sandbox/default URL |
| Mail | external | SMTP, Gmail-compatible defaults |

## Backend Configuration

Backend config is loaded from `service/lenshub/src/main/resources/application.yml`, with optional `.env` import.

Required/important environment variables:

| Variable | Purpose |
| --- | --- |
| `DB_URL` | JDBC PostgreSQL URL. Default: `jdbc:postgresql://localhost:5433/postgres`. |
| `DB_USERNAME` | Database username. Default: `postgres`. |
| `DB_PASSWORD` | Database password. No safe default. |
| `APP_JWT_SECRET` | Access-token JWT signing secret. Replace default before production. |
| `APP_JWT_EXPIRATION_MS` | Access-token lifetime. |
| `APP_JWT_ISSUER` | JWT issuer. Default currently `zyna-app`. |
| `APP_ACTIVATION_BASE_URL` | Account activation callback URL. |
| `APP_ACTIVATION_TTL_HOURS` | Activation token TTL. |
| `APP_ACTIVATION_JWT_SECRET` | Activation token signing secret. Replace default before production. |
| `APP_PASSWORD_RESET_TTL_MINUTES` | Password reset token TTL. |
| `APP_MAIL_FROM` | Sender email address. |
| `MAIL_HOST`, `MAIL_PORT` | SMTP host/port. |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP credentials. |
| `PAY_URL`, `TMN_CODE`, `SECRET_KEY`, `RETURN_URL` | VNPay integration settings. |
| `APP_SCHEDULER_BIRTHDAY_*` | Birthday scheduler settings. |
| `APP_SCHEDULER_VOUCHER_EXPIRING_*` | Voucher expiry scheduler settings. |
| `APP_INVENTORY_LOW_STOCK_THRESHOLD` | Low-stock alert threshold. |
| `APP_E2EE_ENABLED` | Enables the E2EE Shield handshake and protected route filter. Must match the frontend flag. |
| `SERVER_IDENTITY_PRIV_B64` | PKCS#8 EC P-256 private identity key. Accepted formats: raw PEM, base64-encoded PEM, or base64-encoded DER. Store only in a secret manager. |
| `SERVER_IDENTITY_PUB_B64` | X.509 EC P-256 public identity key. Accepted formats: raw PEM, base64-encoded PEM, or base64-encoded DER. |

Current Redis host and port are hardcoded to `localhost:6379` in `application.yml`; make these configurable before production deployment.

## Frontend Configuration

Frontend API base URL is controlled by:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_E2EE_ENABLED=true
NEXT_PUBLIC_SERVER_JWK_X=<server-public-jwk-x>
NEXT_PUBLIC_SERVER_JWK_Y=<server-public-jwk-y>
```

If unset, `frontend/src/lib/http.ts` uses `http://localhost:8080/api`.

The frontend JWK coordinates must come from the backend identity public key.
Enable or disable E2EE on both applications together, then restart both
processes. The current SDK protects policy-selected requests with JSON bodies.
Multipart uploads and VNPay callbacks remain outside the E2EE filter. Sensitive
GET responses still rely on HTTPS and JWT authorization.

## Local Run

Backend:

```powershell
cd service/lenshub
.\gradlew bootRun
```

Frontend:

```powershell
cd frontend
pnpm install
pnpm dev
```

Validation:

```powershell
cd service/lenshub
.\gradlew test

cd ..\..\frontend
pnpm lint
pnpm build
```

## Infrastructure Notes

- `docker/docker-compose.yml` starts a MySQL database named `cms_dev`. It does not match the active PostgreSQL backend configuration.
- `deploy/redis/docker-compose.yml` defines Redis with a password and Swarm-style deploy settings, published on host port `16379`.
- `migration/` contains legacy migration assets, including an Oracle JDBC driver and SQL file. Ownership and current use are unclear.
- No verified PostgreSQL Docker Compose file for `service/lenshub` exists in the repository at this time.

## Production Readiness Checklist

- Externalize all secrets from committed config.
- Remove tracked `.env` files from Git and rotate credentials already present in repository history.
- Add `.env.example` files for backend and frontend.
- Make Redis host, port, and password environment-driven.
- Replace `spring.jpa.hibernate.ddl-auto: update` with controlled migrations for production.
- Define deployment target and CI/CD flow.
- Add health checks and smoke tests.
- Harden CORS beyond `http://localhost:3000`.
- Document backup/restore for PostgreSQL and uploaded files.

## Open Questions

- Production hosting target not documented.
- PostgreSQL provisioning method not documented.
- Legacy MySQL and migration assets ownership unclear.
