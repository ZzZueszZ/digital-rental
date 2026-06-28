# Deployment Guide

## Documentation Maintenance
**Last Updated:** 2026-06-28
**Document Version:** 1.2
**Maintained By:** Development Team

## Scope

This guide documents verified deployment behavior. The backend image and CI/CD
workflow structure are implemented. Production Compose, VPS edge, authenticated
GHCR publication, and backup assets remain in implementation under
`plans/2026-06-28-production-deployment/`.

## Runtime Components

| Component | Path | Runtime |
| --- | --- | --- |
| Backend API | `service/lenshub` | Java 17, Spring Boot 4, Gradle |
| Frontend | `frontend` | Node.js, pnpm, Next.js 16 |
| Database | external | PostgreSQL expected by `application.yml` |
| Cache | external | Redis expected by `application.yml` |
| Object storage | `docker/docker-compose.yml` | MinIO, private `rental-assets` bucket |
| Payments | external | VNPay sandbox/default URL |
| Mail | external | SMTP, Gmail-compatible defaults |

## Backend Configuration

Backend config is loaded from `service/lenshub/src/main/resources/application.yml`, with optional `.env` import.
Production activates `application-prod.yml` with `SPRING_PROFILES_ACTIVE=prod`.
The production profile fails startup when required configuration is missing or unsafe.

Required/important environment variables:

| Variable | Purpose |
| --- | --- |
| `DB_URL` | JDBC PostgreSQL URL. Default: `jdbc:postgresql://localhost:5433/postgres`. |
| `DB_USERNAME` | Database username. Default: `postgres`. |
| `DB_PASSWORD` | Database password. No safe default. |
| `APP_JWT_SECRET` | Access-token JWT signing secret; minimum 32 characters in production. |
| `APP_JWT_EXPIRATION_MS` | Access-token lifetime. |
| `APP_JWT_ISSUER` | JWT issuer. Default currently `zyna-app`. |
| `APP_ACTIVATION_BASE_URL` | Account activation callback URL. |
| `APP_ACTIVATION_TTL_HOURS` | Activation token TTL. |
| `APP_ACTIVATION_JWT_SECRET` | Separate activation-token signing secret; minimum 32 characters. |
| `APP_PASSWORD_RESET_TTL_MINUTES` | Password reset token TTL. |
| `APP_MAIL_FROM` | Sender email address. |
| `MAIL_HOST`, `MAIL_PORT` | SMTP host/port. |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP credentials. |
| `PAY_URL`, `TMN_CODE`, `SECRET_KEY`, `RETURN_URL` | VNPay integration settings. |
| `APP_SCHEDULER_BIRTHDAY_*` | Birthday scheduler settings. |
| `APP_SCHEDULER_VOUCHER_EXPIRING_*` | Voucher expiry scheduler settings. |
| `APP_INVENTORY_LOW_STOCK_THRESHOLD` | Low-stock alert threshold. |
| `APP_E2EE_ENABLED` | Enables the E2EE Shield handshake and protected route filter. Must match the frontend flag. |
| `MINIO_INTERNAL_ENDPOINT` | MinIO S3 endpoint used by backend object operations. Local default: `http://localhost:9000`. |
| `MINIO_PUBLIC_ENDPOINT` | Browser-reachable S3 endpoint embedded in presigned URLs. Must not be Docker hostname `minio`. |
| `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | MinIO API credentials. Use a scoped service account outside local development. |
| `MINIO_BUCKET` | Private object bucket. Default: `rental-assets`. |
| `MINIO_UPLOAD_EXPIRY_MINUTES`, `MINIO_DOWNLOAD_EXPIRY_MINUTES` | Presigned URL lifetimes. Default: 5 minutes. |
| `APP_KYC_PROVIDER` | Production profile fixes provider to `fpt`. |
| `FPT_KYC_API_KEY` | Required FPT.AI credential in production. |
| `SERVER_IDENTITY_PRIV_B64` | PKCS#8 EC P-256 private identity key. Accepted formats: raw PEM, base64-encoded PEM, or base64-encoded DER. Store only in a secret manager. |
| `SERVER_IDENTITY_PUB_B64` | X.509 EC P-256 public identity key. Accepted formats: raw PEM, base64-encoded PEM, or base64-encoded DER. |

Redis host, port, and password are environment-driven. Production requires a non-empty Redis password.

Production validation also requires PostgreSQL JDBC URL, HTTPS activation/VNPay/MinIO public URLs, HTTPS FPT endpoints, and HTTPS non-wildcard CORS origins.

## Database Migrations

- Flyway migration location: `service/lenshub/src/main/resources/db/migration`.
- V1 baseline: `V1__baseline.sql`.
- Production Hibernate mode: `validate`.
- Empty database: start with PROD profile; Flyway creates schema before Hibernate validation.
- Existing non-empty database: backup and compare schema, then set `FLYWAY_BASELINE_ON_MIGRATE=true` for one rehearsed baseline run only. Return it to `false` immediately.
- Never edit an applied migration. Use expand/contract migrations for rollback compatibility.

Detailed procedure: `service/lenshub/src/main/resources/db/migration/README.md`.

## Health Endpoints

Public status-only endpoints:

```text
GET /api/actuator/health
GET /api/actuator/health/liveness
GET /api/actuator/health/readiness
```

Only Actuator `health` is exposed. Details are disabled. Component paths such as `/api/actuator/health/db` require authentication. Swagger/OpenAPI is disabled by the PROD profile.

## Backend Container

Build the production image from the backend directory:

```powershell
cd service/lenshub
docker build --platform linux/amd64 -t lenshub-backend:local .
```

The production `Dockerfile`:

- uses digest-pinned Java 17 Alpine builder and JRE images;
- builds with the Gradle wrapper in a separate stage;
- runs as non-root `10001:10001`;
- limits JVM heap to `-Xms256m -Xmx768m` and exits on OOM;
- checks `/api/actuator/health/readiness`;
- copies only the executable JAR into the runtime image.

Verified image evidence on 2026-06-28: Linux amd64, Java 17.0.19,
181,517,454 bytes, non-root runtime, readable JAR, healthcheck and OCI labels
present, and no secret patterns in image history.

Before production release, Phase 03 or CI must still verify dependency startup,
the Docker healthy transition, peak memory, read-only root filesystem with
tmpfs, repeat-build cache behavior, the final container contract test, and a
current CVE scan.

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

- `docker/docker-compose.yml` is the local PostgreSQL, Redis, and MinIO stack. It is not the production Compose file.
- MinIO uses API port `9000`, Console port `9001`, and one-shot `minio-init` for the private `rental-assets` bucket.
- Copy `.env.example` to `.env` for local MinIO. The checked-in `minioadmin` values are local-only fixtures; production must use distinct secrets and HTTPS.
- Set `MINIO_PUBLIC_ENDPOINT` to the hostname a browser can resolve. When backend runs inside Docker, set only `MINIO_INTERNAL_ENDPOINT=http://minio:9000`; do not use that hostname for browser-facing presigned URLs.
- `deploy/redis/docker-compose.yml` defines Redis with a password and Swarm-style deploy settings, published on host port `16379`.
- `migration/` contains legacy migration assets, including an Oracle JDBC driver and SQL file. Ownership and current use are unclear.
- Backend production image is implemented. Production Compose and NGINX assets are not implemented yet.

## Production Readiness Checklist

- Completed: remove real MinIO secret defaults; require and validate production secrets.
- Remove tracked `.env` files from Git and rotate credentials already present in repository history.
- Add `.env.example` files for backend and frontend.
- Completed: Redis host, port, and password are environment-driven.
- Completed: Flyway plus production Hibernate `validate`.
- Every branch push runs backend tests plus frontend lint/build. A successful
  push to `master`—including a merged pull request—also publishes
  `sha-<commit>` and `prod` backend tags to GHCR and exposes the image digest as
  a job output.
- CD is temporarily manual through `workflow_dispatch`. It accepts only the
  LensHub backend image with a full `sha-<commit>` tag or `sha256` digest.
  Automatic deployment remains disabled until production rollback is verified.
- Backend tests and frontend lint/build are verified on GitHub. GHCR
  publication and digest verification remain pending until the first successful
  push to `master`.
- Completed: application health contract and backend image. Container integration and external smoke checks remain release gates.
- Harden CORS to the production frontend domain and any explicitly approved staging domains.
- Document backup/restore for PostgreSQL and uploaded files.

## Open Questions

- Existing production database empty/baseline state not confirmed.
- VPS OS and SSH user not confirmed.
- Legacy MySQL and migration assets ownership unclear.
