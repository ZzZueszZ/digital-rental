# Codebase Summary

## Documentation Maintenance
**Last Updated:** 2026-06-28
**Document Version:** 1.2
**Maintained By:** Development Team

## High-Level Shape

This is a multi-project repository:

- `service/lenshub`: primary backend.
- `service/ai-kyc-service`: self-hosted FastAPI KYC AI provider compatible with FPT OCR, facematch, and liveness endpoint contracts.
- `frontend`: primary Next.js frontend.
- `docker`, `deploy`, `migration`: local and deployment support.

## Backend: `service/lenshub`

`service/lenshub` is a Gradle project named `lenshub`, using Java 17 and Spring Boot 4.0.3. Important dependencies include Spring Web, Data JPA, Security, Validation, Redis, Mail, Actuator, Flyway, PostgreSQL runtime driver, MinIO, JJWT, and springdoc OpenAPI.

Main application entrypoint:

- `service/lenshub/src/main/java/org/web/Main.java`

Key configuration:

- `configs/SecurityConfig.java`: stateless JWT, CORS, public route allowlist, method security.
- `security/JwtAuthenticationFilter.java`: bearer token authentication filter.
- `security/JwtUtil.java`: JWT parsing and authority mapping.
- `common/dto/ApiResponse.java`: shared API envelope.
- `common/exceptions/GlobalExceptionHandler.java`: centralized REST exception handling.
- `configs/OpenApiConfig.java`: Swagger/OpenAPI setup.
- `configs/SchedulerConfig.java`: scheduled task configuration.
- `configs/StartupInitializer.java`: startup initialization.
- `configs/ProductionEnvironmentValidator.java`: fail-fast production secret and endpoint validation.
- `application-prod.yml`: FPT production provider, Flyway, Hibernate validate, health-only Actuator, disabled Swagger.
- `db/migration/V1__baseline.sql`: reviewed initial PostgreSQL schema.
- `Dockerfile`: digest-pinned multi-stage Java 17 production image with non-root runtime, bounded heap, and readiness healthcheck.
- `.dockerignore`: excludes secrets, local state, tests, and build output from the image context.

Module directories:

| Module | Purpose |
| --- | --- |
| `addresses` | Shipping address management. |
| `authentication` | Auth, tokens, roles, permissions, activation, password reset. |
| `carts` | Cart item management. |
| `categories` | Category CRUD and restore flows. |
| `dashboard` | Admin dashboard summaries. |
| `identity` | KYC/eKYC sessions, artifacts, required liveness video, status, and admin review endpoints. |
| `inventory` | Stock adjustment and audit logs. |
| `orders` | Checkout and order management. |
| `payments` | VNPay and payment logs. |
| `products` | Product catalog, gallery, price history. |
| `rentals` | Rental checkout, device availability, lifecycle, deposits, handover/return reporting. |
| `reviews` | Product reviews and moderation. |
| `support` | Support ticket creation and admin handling. |
| `users` | User management and profile features. |
| `vouchers` | Voucher CRUD and application. |
| `files` | Private file asset metadata, purpose policy, and authenticated presigned URL APIs. |
| `storage` | MinIO-compatible object storage adapter and configuration. |

## Backend API Surface

The backend is mounted at `/api`. Controllers expose these base routes:

- `/auth`
- `/roles`
- `/permissions`
- `/products`
- `/categories`
- `/reviews`
- `/carts`
- `/orders`
- `/inventory`
- `/users`
- `/profile`
- `/dashboard`
- `/vouchers`
- `/payments/vnpay`
- `/payments/logs`
- `/addresses`
- `/rentals`
- `/identity`
- `/ekyc`
- `/admin/ekyc`
- `/support/tickets`
- `/admin/support/tickets`
- `/audit-logs`

Public routes are configured in `SecurityConfig`: auth, uploads, Swagger/OpenAPI outside PROD, product/category reads, product review reads, VNPay routes, public support ticket creation, and status-only health probes. Other routes require authentication and many use `@PreAuthorize`.

## Main Frontend: `frontend`

`frontend` is a Next.js 16 app with React 19 and TypeScript.

Important files:

- `frontend/src/app/layout.tsx`: root layout, Inter font, providers.
- `frontend/src/app/providers.tsx`: TanStack Query, theme provider, session guard, loading overlay, toaster.
- `frontend/src/lib/http.ts`: axios client with access-token injection and refresh queue.
- `frontend/src/store/auth.ts`: Zustand auth state.
- `frontend/src/services/*.ts`: API service modules.
- `frontend/src/components/ui`: shadcn-style reusable UI components.

Route groups:

- `(main)`: public/customer pages.
- `(auth)`: login, register, forgot/reset password, activation, verification.
- `(admin)`: dashboard, users, products, categories, orders, vouchers, audit logs, settings.
- `(staff)` and `(super-admin)`: role-specific entry pages.

## Local Infrastructure

`application.yml` expects PostgreSQL at `localhost:5433` and Redis at `localhost:6379` by default.

Current repository infra files:

- `docker/docker-compose.yml`: local PostgreSQL, Redis, and MinIO stack.
- `deploy/redis/docker-compose.yml`: Redis compose with password and Swarm deploy settings, published on host port `16379`.
- `migration/`: legacy migration assets. Current ownership unclear.

MinIO infrastructure uses private `rental-assets`, API port `9000`, Console port `9001`, and idempotent initialization. Authenticated file APIs issue short-lived presigned PUT/GET URLs and persist `FileAsset` metadata.

The backend production image exists. No production Compose file exists yet.

## AI KYC Service: `service/ai-kyc-service`

`service/ai-kyc-service` is a Python FastAPI service for local/self-hosted eKYC provider execution. It exposes FPT-compatible endpoints so `service/lenshub` can keep using `FptKycProvider` by changing only:

- `FPT_KYC_IDR_URL`
- `FPT_KYC_FACEMATCH_URL`
- `FPT_KYC_LIVENESS_URL`
- `FPT_KYC_API_KEY`

Implemented endpoints:

- `POST /vision/idr/vnm/`: CCCD OCR contract.
- `POST /dmp/checkface/v1`: two-image face match contract.
- `POST /dmp/liveness/v3`: liveness video contract.
- `GET /health`: service health check.

The MVP is CPU-only, uses lazy optional imports for heavier model packages, and includes API contract tests. Face match now fails closed when InsightFace/ONNX Runtime is unavailable instead of using whole-image perceptual similarity. Liveness now validates real video metadata before model work, samples bounded frames, runs active pose through an optional MediaPipe Face Landmarker model, and can run passive ONNX anti-spoof on CPU. Missing liveness models fail closed while keeping the Java-compatible `data` response stable and putting debug details in `diagnostics`.

## Documentation Gaps

- No formal API endpoint reference yet.
- Production deployment Phases 01 and 02 are implemented; container runtime validation plus VPS Compose, edge, and CI/CD phases remain.
- No test strategy document yet.
- Legacy migration and MySQL compose ownership is unclear.
