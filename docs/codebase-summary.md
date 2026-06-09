# Codebase Summary

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
**Maintained By:** Development Team

## High-Level Shape

This is a multi-project repository:

- `service/lenshub`: primary backend.
- `frontend`: primary Next.js frontend.
- `docker`, `deploy`, `migration`: local and deployment support.

## Backend: `service/lenshub`

`service/lenshub` is a Gradle project named `lenshub`, using Java 17 and Spring Boot 4.0.3. Important dependencies include Spring Web, Data JPA, Security, Validation, Redis, Mail, PostgreSQL runtime driver, Lombok, ModelMapper, JJWT, and springdoc OpenAPI.

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

Public routes are configured in `SecurityConfig`: auth, uploads, Swagger/OpenAPI, product/category reads, product review reads, VNPay payment routes, and public support ticket creation. Other routes require authentication and many use `@PreAuthorize`.

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

- `docker/docker-compose.yml`: legacy MySQL CMS compose. Do not assume it supports `service/lenshub`.
- `deploy/redis/docker-compose.yml`: Redis compose with password and Swarm deploy settings, published on host port `16379`.
- `migration/`: legacy migration assets. Current ownership unclear.

No verified PostgreSQL Docker Compose file for the active backend was found.

## Documentation Gaps

- No formal API endpoint reference yet.
- Deployment guide exists but still needs production target and secrets policy decisions.
- No test strategy document yet.
- Legacy migration and MySQL compose ownership is unclear.
