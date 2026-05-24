# Project memory

This project is a Lenshub camera equipment sales and rental website with AI eKYC and an E2EE-SHIELD security direction.

## Active stack

- Main frontend: `frontend/` using Next.js, React, TypeScript, TanStack Query, Axios, Zustand, Zod, and Tailwind-style components.
- Main backend: `service/lenshub/` using Spring Boot, Spring Security, JPA, Redis, mail, PostgreSQL, JWT, and VNPAY.
- Legacy/platform stack: `ui/`, `service/cms-service/`, `service/microservice-starter/`, `platform-protos/java/`.

## User preferences

- Prefer normal Vietnamese sentence/title casing in UI.
- Avoid uppercase-heavy labels and modal text unless a component convention requires it.
- When editing product management UI, check admin, staff, and super-admin duplicates.

## Security-sensitive context

- Auth, refresh token, eKYC artifacts, payment callbacks, identity documents, face images, and encryption/key-handling are sensitive.
- Avoid logging sensitive identity/auth/payment data.
- Preserve VNPAY signature verification and transaction logging behavior.
- For E2EE-SHIELD work, do not weaken confidentiality or key isolation for convenience.
