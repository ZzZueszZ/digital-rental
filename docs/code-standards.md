# Code Standards

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
**Maintained By:** Development Team

## General Standards

- Keep code grouped by existing module boundaries.
- Prefer small service methods with explicit DTOs over leaking entities into controllers.
- Keep user-facing API responses wrapped in `ApiResponse<T>`.
- Do not add new frameworks when existing project tools already solve the problem.
- Keep configuration values in environment variables for production. Do not add real secrets to repository files.

## Backend Standards

### Structure

Use the current backend module structure:

```text
org/web/<module>/
+-- controller/
+-- service/
+-- service/impl/
+-- repository/
+-- model/
+-- dto/request/
+-- dto/response/
+-- mapper/
```

Not every module has every folder. Add folders only when the module needs them.

### Controllers

- Keep controller base paths consistent with existing plural resource paths such as `/products`, `/orders`, and `/users`.
- Return `ResponseEntity<ApiResponse<...>>` for JSON APIs.
- Use request DTOs for inbound payloads.
- Use `@Valid` when DTO validation annotations are present.
- Put authorization at controller method level with `@PreAuthorize` when behavior is permission-specific.

### Services

- Keep business rules in service implementations, not controllers.
- Follow the current interface plus `impl` pattern for non-trivial modules.
- Keep transactional operations explicit where data consistency matters.

### Persistence

- Use JPA repositories in each module's `repository` package.
- Keep entity relationships in `model` classes and response projection in mapper classes.
- Prefer soft-delete/restore patterns where the existing module already uses them.

### Security

- Use stateless JWT auth through `JwtAuthenticationFilter`.
- Use BCrypt for password hashing.
- Keep public routes centralized in `SecurityConfig`.
- Add new authorities through the role/permission model and seeders when needed.
- Do not bypass `@PreAuthorize` for admin features.

### API Response Format

Use the shared envelope:

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {},
  "pagination": {
    "pageNumber": 0,
    "pageSize": 10,
    "totalPages": 1,
    "totalElements": 1
  },
  "meta": {}
}
```

Omit `pagination` and `meta` when they do not apply.

## Main Frontend Standards: `frontend`

- Use TypeScript and App Router conventions.
- Keep reusable UI primitives in `src/components/ui`.
- Keep page-specific components near their route folder.
- Use service modules in `src/services` for backend calls.
- Use `src/lib/http.ts` for authenticated API calls and refresh handling.
- Use TanStack Query for server data and Zustand for client auth/loading state.
- Use shadcn/Tailwind tokens from `src/styles/globals.css`.
- Use lucide-react icons where a common icon exists.

## Naming

- Java classes: `PascalCase`.
- Java methods and fields: `camelCase`.
- TypeScript components: `PascalCase`.
- TypeScript functions and variables: `camelCase`.
- Route folders follow the framework convention already in use.

## Testing and Validation

- Backend: add or update Spring tests for service or controller behavior when business rules change.
- Frontend: run lint/build scripts before merging UI changes.
- Existing scripts:
  - `service/lenshub/gradlew test`
  - `frontend/pnpm lint`
  - `frontend/pnpm build`

## Documentation Rule

When adding or changing modules, endpoints, configuration, auth permissions, or major UI flows, update the relevant file in `docs/` in the same change.
