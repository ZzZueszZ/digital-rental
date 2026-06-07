# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

This repository is for a camera equipment sales and rental website integrating AI eKYC/identity verification and the E2EE-SHIELD security direction. The active product is the Lenshub stack:

- `frontend/`: the main customer/admin web app built with Next.js, React, TypeScript, TanStack Query, Axios, Zustand, Zod, and Tailwind-style components.
- `service/lenshub/`: the main Spring Boot API for catalog, sales orders, rentals, inventory, payments, support, user profile, authentication, and AI eKYC/identity workflows.

There are also legacy/platform modules:

- `ui/`: older Vite React CMS/admin portal.
- `service/cms-service/`: separate Spring Boot CMS-style service.
- `service/microservice-starter/`: shared Spring Boot starter used by `cms-service`.
- `platform-protos/java/`: shared protobuf/gRPC Java library used by the CMS/platform stack.

For current product work, prefer `frontend/` and `service/lenshub/` unless the user explicitly asks for the legacy CMS/UI stack.

## Common commands

### Frontend: `frontend/`

Use pnpm because the app has `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

```bash
cd frontend
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm start
```

The Next.js dev server runs on `http://localhost:3000` by default. The active Axios client reads `NEXT_PUBLIC_API_URL` and falls back to `http://localhost:8080/api`. `frontend/.env.example` currently uses `NEXT_PUBLIC_API_BASE_URL`, so verify env variable names when wiring new config.

There is no test script in `frontend/package.json` at the time this file was written.

### Backend: `service/lenshub/`

```bash
cd service/lenshub
./gradlew bootRun
./gradlew build
./gradlew test
./gradlew test --tests 'fully.qualified.TestClassName'
./gradlew test --tests 'fully.qualified.TestClassName.testMethodName'
```

Lenshub runs on port `8080` with servlet context path `/api`. It imports environment variables from `service/lenshub/.env` via `spring.config.import=optional:file:.env[.properties]`. Use `service/lenshub/.env.example` as the template.

### Legacy Vite UI: `ui/`

```bash
cd ui
npm install
npm run dev
npm run build
npm run lint
npm run lint:fix
npm run prettier
npm run prettier:fix
npm run build:types
```

### CMS/platform Java modules

```bash
cd service/cms-service
./gradlew build
./gradlew test
./gradlew bootRun
```

```bash
cd service/microservice-starter
./gradlew build
./gradlew publishToMavenLocal
```

```bash
cd platform-protos/java
./gradlew build
./gradlew publishToMavenLocal
```

`cms-service` can depend on local `microservice-starter` and `platform-protos` when its Gradle properties enable the debug project dependencies.

## Architecture notes

### Lenshub backend

The main API source root is `service/lenshub/src/main/java/org/web`. It is organized by business feature rather than by global layers. Most modules follow this shape:

- `controller`: REST endpoints.
- `dto`: request/response payloads.
- `mapper`: DTO/entity conversion.
- `model`: JPA entities.
- `repository`: Spring Data repositories.
- `service`: interfaces and implementations.

Important modules include:

- `authentication`: login, registration, activation, refresh token, password flows, roles, permissions.
- `security`: JWT utilities, authentication filter, access denied/auth entrypoint handlers.
- `configs`: Spring Security, CORS, OpenAPI, scheduling, mapper configuration.
- `products`, `categories`: camera equipment catalog management.
- `orders`: purchase checkout and order management.
- `rentals`: rental availability, checkout, contracts, approval, deposit/return lifecycle, device condition reports.
- `inventory`: stock adjustment and inventory audit logs for sale/rental stock.
- `payments`: VNPAY integration and payment transaction logging.
- `identity`: AI eKYC/identity verification sessions, artifacts, reviews, face verification, risk assessment.
- `users`, `addresses`, `reviews`, `vouchers`, `support`, `dashboard`: supporting commerce/admin features.

`service/lenshub/src/main/resources/application.yml` configures PostgreSQL, Redis, mail, JWT, VNPAY, multipart upload limits, scheduler settings, and JPA behavior. The current dev JPA setting is `ddl-auto: update`.

Spring Security permits selected public endpoints such as auth, uploads, Swagger, public product/category/review reads, rental availability, VNPAY callbacks, and public support ticket creation; other requests are authenticated.

### Frontend app

The main source root is `frontend/src`.

- `app/`: Next.js App Router route groups for `(main)`, `(auth)`, `(admin)`, `(staff)`, `(super-admin)`, plus local API routes under `app/api`.
- `services/`: API service wrappers and React Query hooks, generally mirroring backend feature names.
- `lib/http.ts`: primary auth-aware Axios client with auth header injection, refresh-token queueing, loading state hooks, and `withCredentials`.
- `store/`: Zustand auth/loading stores.
- `components/`: shared UI plus domain/admin/layout/auth components.
- `types/`: TypeScript API/domain types.
- `schemas/`: Zod validation schemas.
- `constants/`: route/query key/enumeration constants.

Prefer `frontend/src/lib/http.ts` and the feature service files in `frontend/src/services/` for new API calls. `frontend/src/services/api.ts` is a simpler Axios instance and should not be assumed to be the main auth-aware client.

Admin, staff, and super-admin sections contain duplicated product-management components. If changing shared product behavior or UI in one role area, check whether equivalent files exist under the other role route groups.

### Legacy/platform stack

The older stack is useful for CMS/platform references but is not the primary Lenshub app:

- `ui/` is a Vite React CMS/admin portal.
- `service/cms-service/` is a Spring Boot CMS-style service.
- `service/microservice-starter/` provides shared Spring Boot infrastructure for the CMS stack.
- `platform-protos/java/` provides protobuf/gRPC Java support.

Do not apply CMS/UI patterns to Lenshub unless the user explicitly asks for that stack.

## UI/content preferences

Use Vietnamese UI copy naturally. Do not overuse uppercase text in frontend UI. Prefer normal sentence/title casing for labels and copy unless an existing design-system component specifically requires uppercase.

## Security-sensitive areas

This project includes authentication, refresh tokens, AI eKYC/identity data, uploaded identity artifacts, payment callbacks, and the E2EE-SHIELD security direction. Treat these areas as security-sensitive:

- Keep auth changes aligned between `frontend/src/lib/http.ts`, `frontend/src/store/auth.ts`, backend `authentication`, backend `security`, and `SecurityConfig`.
- Avoid logging eKYC identity documents, face images, verification artifacts, tokens, or other sensitive user data.
- Payment changes must preserve VNPAY signature verification and transaction logging behavior.
- For E2EE-SHIELD-related work, keep encryption/key-handling decisions explicit and avoid weakening confidentiality for convenience.
- Do not modify real `.env` files unless the user explicitly asks; use `.env.example` for documented config changes.

## Generated files and design files

- Do not read `.pen` files with filesystem tools; access Pencil design files only through the Pencil MCP tools.
- Avoid treating `.next/`, build outputs, Gradle build directories, generated protobuf outputs, or uploaded runtime files as source files.
