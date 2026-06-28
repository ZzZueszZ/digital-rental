# Test Report: Phase 01 Production Safety

**Date:** 2026-06-28
**Status:** PASS

## Results

- Gradle clean test: 41/41 passed, 0 skipped.
- Compile and `bootJar`: passed.
- New configuration tests: production secrets, Flyway/validate profile,
  sanitized health exposure.
- Activation tokens verified against their dedicated signing secret.
- Existing file asset tests: passed after restoring direct presigned MinIO PUT.

## Fresh Database Integration

- Created isolated PostgreSQL database.
- PROD application started with Flyway enabled.
- Flyway applied `V1__baseline.sql`: version `1`, success `true`.
- Hibernate `ddl-auto=validate`: passed.
- Public tables after migration: 44, including `flyway_schema_history`.
- Redis-backed readiness: `200 {"status":"UP"}`.
- Liveness: `200 {"status":"UP"}`.
- Protected component health path `/actuator/health/db`: `401`.
- Top-level health body hid component details.
- Test database, Redis container, and application process cleaned up.

## Initial Failure and Resolution

- `FileAssetServiceImplTest` expected external presigned URL while current service
  returned backend-relative upload path.
- Test matched locked PROD architecture and existing frontend support.
- Restored `StorageService.presignPut`; targeted tests and full suite passed.
- Initial Flyway run did not execute because Spring Boot 4 requires
  `spring-boot-starter-flyway`; dependency corrected and migration verified.

## Warnings

- Global health was `DOWN` in isolated test because dummy external service
  configuration was intentionally incomplete. Deployment readiness/liveness
  remained `UP` and sanitized.
- Local development MinIO port currently returns an empty HTTP response; handle
  in infrastructure phase.
- Existing compile warnings: deprecated API and unchecked operations.
- Coverage plugin not configured; no coverage percentage available.

## Unresolved Questions

- None blocking Phase 01.
