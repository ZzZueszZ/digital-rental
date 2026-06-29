# LensHub Backend API

## Documentation Maintenance

**Last Updated:** 2026-06-29
**Document Version:** 1.0
**Maintained By:** Development Team

`service/lenshub` is the primary LensHub API. It powers catalog, authentication, orders, rentals, payments, eKYC, file storage, admin workflows, support tickets, mail, and audit features.

## Stack

- Java 17
- Spring Boot 4
- Gradle wrapper
- PostgreSQL
- Redis
- Flyway
- MinIO-compatible object storage
- JWT authentication
- VNPay payment integration
- FPT-compatible KYC provider
- Resend/SMTP mail transport

## Modules

Main source root:

```text
src/main/java/org/web
```

Key modules:

| Module | Purpose |
| --- | --- |
| `authentication`, `security` | Login, registration, JWT, roles, permissions, activation, password reset. |
| `products`, `categories`, `inventory` | Catalog and stock management. |
| `carts`, `orders`, `payments` | Sales checkout, order lifecycle, VNPay. |
| `rentals` | Rental checkout, devices, contracts, handover, return reports, deposits. |
| `identity` | eKYC sessions, OCR preview, face match, liveness, risk, admin review. |
| `files`, `storage` | File asset metadata and MinIO presigned URLs. |
| `users`, `addresses`, `reviews`, `support`, `dashboard`, `vouchers` | User and admin business features. |

## Prerequisites

- JDK 17
- Docker Desktop for local PostgreSQL, Redis, and MinIO
- PowerShell on Windows, or equivalent shell for commands

## Local Infrastructure

From repository root:

```powershell
docker compose -f docker/docker-compose.dev.yml up -d
```

This starts PostgreSQL on host port `5433`, Redis on `6379`, and MinIO on `9000`/`9001`.

## Environment

Create a local env file:

```powershell
Copy-Item .env.example .env
```

Important groups:

| Group | Variables |
| --- | --- |
| Database | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` |
| JWT/activation | `APP_JWT_SECRET`, `APP_ACTIVATION_JWT_SECRET`, `APP_ACTIVATION_BASE_URL` |
| Mail | `APP_MAIL_PROVIDER`, `APP_MAIL_FROM`, `RESEND_API_KEY`, SMTP fallback vars |
| VNPay | `PAY_URL`, `TMN_CODE`, `SECRET_KEY`, `RETURN_URL` |
| MinIO | `MINIO_INTERNAL_ENDPOINT`, `MINIO_PUBLIC_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` |
| KYC | `APP_KYC_PROVIDER`, `FPT_KYC_API_KEY`, `FPT_KYC_IDR_URL`, `FPT_KYC_FACEMATCH_URL`, `FPT_KYC_LIVENESS_URL` |
| E2EE | `APP_E2EE_ENABLED`, `SERVER_IDENTITY_PRIV_B64`, `SERVER_IDENTITY_PUB_B64` |

Do not commit real secrets. Keep committed files placeholder-only.

## Run

```powershell
.\gradlew bootRun
```

Default API base URL:

```text
http://localhost:8080/api
```

Health:

```text
GET http://localhost:8080/api/actuator/health
```

## Test

```powershell
.\gradlew test
```

Run a single test class:

```powershell
.\gradlew test --tests org.web.common.utils.FileUploadUtilTest
```

## Build

```powershell
.\gradlew clean bootJar
```

## Docker Image

Build from this directory:

```powershell
docker build -t lenshub-backend:local .
```

The production Dockerfile uses a multi-stage Java 17 Alpine build, runs as non-root, installs `ffmpeg` for `ffprobe`, sets bounded JVM heap, and checks readiness at `/api/actuator/health/readiness`.

## API Documentation

Swagger/OpenAPI is available outside the production profile. Production disables Swagger and exposes health status only.

Common base routes include:

```text
/auth
/products
/categories
/carts
/orders
/rentals
/payments/vnpay
/identity
/ekyc
/admin/ekyc
/files
/support/tickets
/admin/support/tickets
```

See [../../docs/codebase-summary.md](../../docs/codebase-summary.md) and [../../docs/system-architecture.md](../../docs/system-architecture.md) for the full API/module overview.

## KYC Provider Modes

Local default can use:

```env
APP_KYC_PROVIDER=mock
```

To use the local AI KYC service:

```env
APP_KYC_PROVIDER=fpt
FPT_KYC_API_KEY=local-dev-key
FPT_KYC_IDR_URL=http://localhost:8000/vision/idr/vnm/
FPT_KYC_FACEMATCH_URL=http://localhost:8000/dmp/checkface/v1
FPT_KYC_LIVENESS_URL=http://localhost:8000/dmp/liveness/v3
```

See [../ai-kyc-service/README.md](../ai-kyc-service/README.md).

## Production Notes

- Activate production with `SPRING_PROFILES_ACTIVE=prod`.
- Production requires safe JWT, activation, database, Redis, MinIO, FPT, Resend, CORS, and HTTPS endpoint configuration.
- Flyway migrations run in production; Hibernate uses schema validation.
- Production Compose is in `../../docker/docker-compose.prod.yml`.
- Real prod env file is intentionally not committed.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| App fails on database connection | Confirm local Compose is running and `DB_URL` points to `localhost:5433`. |
| Redis auth error | Local Redis has no password by default; production requires one. |
| MinIO upload/download fails | Check internal/public endpoints and bucket initialization. |
| KYC liveness duration validation fails | Confirm `ffprobe` exists in runtime image or local PATH. |
| Swagger missing | Check active profile; Swagger is disabled in production. |
