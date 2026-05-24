# Project rules

## Scope rules

- For current product features, work in `frontend/` and `service/lenshub/` by default.
- Only modify `ui/`, `service/cms-service/`, `service/microservice-starter/`, or `platform-protos/java` when the task explicitly targets the legacy/platform stack.
- Do not treat generated output directories as source: `.next/`, Gradle `build/`, generated protobuf files, and runtime upload folders.

## Frontend rules

- Use `frontend/src/lib/http.ts` and feature services in `frontend/src/services/` for authenticated API integration.
- Do not assume `frontend/src/services/api.ts` is the main auth-aware client.
- Keep duplicated admin/staff/super-admin product-management UI consistent when changing shared behavior.
- Use natural Vietnamese copy and avoid uppercase-heavy UI styling.
- Keep forms aligned with existing Zod schemas and TypeScript types where present.

## Backend rules

- Keep Lenshub modules feature-based under `service/lenshub/src/main/java/org/web`.
- Place new REST endpoints in the relevant feature `controller` package.
- Place request/response DTOs in the feature `dto` package and persistence models in `model`.
- Keep auth/security changes aligned across `authentication`, `security`, `configs/SecurityConfig.java`, `frontend/src/lib/http.ts`, and `frontend/src/store/auth.ts`.

## eKYC and E2EE-SHIELD rules

- Treat identity documents, face images, verification artifacts, tokens, and payment data as sensitive.
- Do not add logs that expose sensitive identity/auth/payment data.
- Do not bypass verification, encryption, or signature checks to make flows easier.
- For encryption/key-handling changes, keep the data boundary and key ownership explicit.

## Environment and config rules

- Do not modify real `.env` files unless explicitly requested.
- Document env changes in `.env.example` files.
- Verify frontend API env variable names before adding new config because existing code uses `NEXT_PUBLIC_API_URL` while `frontend/.env.example` mentions `NEXT_PUBLIC_API_BASE_URL`.
