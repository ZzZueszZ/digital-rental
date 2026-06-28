# Code Review: Phase 01 Production Safety

**Date:** 2026-06-28
**Result:** APPROVED

## Scope

- Spring Boot dependencies and PROD configuration.
- Flyway V1 baseline and non-empty database policy.
- Actuator health exposure and Spring Security matchers.
- Production secret/environment validation.
- Activation-token signing key separation.
- Direct presigned MinIO upload restoration.
- Unit and runtime integration evidence.

## Findings

### Critical

- None.

### High

- None after fixes.

### Resolved during review

- Activation tokens reused access-token JWT secret. Changed to dedicated
  `app.activation.jwt-secret`; dedicated signing test added.
- Production validator accepted short JWT secrets and insecure public URLs.
  Added 32-character minimum signing secrets, PostgreSQL JDBC validation,
  HTTPS checks for public/FPT endpoints, and HTTPS-only non-wildcard CORS.
- Spring Boot 4 Flyway auto-configuration required
  `spring-boot-starter-flyway`; corrected and integration-tested.

### Non-blocking

- No JaCoCo coverage plugin; test count only.
- Existing compiler warnings remain outside Phase 01.
- Local development MinIO port behavior needs Phase 03 investigation.
- V1 is large generated DDL. Future changes must be new migrations; never edit V1
  after first production application.

## Verification

- `git diff --check`: passed.
- Gradle tests: 41/41 passed.
- Fresh PostgreSQL migration: passed.
- Hibernate schema validation: passed.
- Readiness/liveness: `200`.
- Detailed health component route without auth: `401`.
- No literal MinIO secret remains in active application configuration.

## Unresolved Questions

- Production database empty vs existing remains a deployment-time gate; both
  documented paths are safe when followed.
