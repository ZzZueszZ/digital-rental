# Phase 01: Production Safety and Configuration

## Context links

- [Parent plan](plan.md)
- [Current analysis](reports/analysis-current-production-readiness.md)
- `service/lenshub/src/main/resources/application.yml`
- `service/lenshub/build.gradle`

## Overview

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** DONE (2026-06-28)
**Review Status:** APPROVED
Remove unsafe defaults, establish health and migration contracts before container deployment.

**Progress:** Step 6 complete - user approved; status and documentation finalized.

## Key Insights

- `ddl-auto=update` prevents predictable rollback and schema audit.
- Current MinIO default credentials are production-dangerous.
- No health endpoint exists for Compose/CD readiness.
- Existing database state changes Flyway baseline method.

## Requirements

- Production fails startup when mandatory secrets absent.
- `APP_KYC_PROVIDER=fpt`; local AI URLs not configured.
- Add Actuator health only; hide details from public callers.
- Production profile uses `ddl-auto=validate`.
- Flyway owns future schema changes.

## Architecture

```text
application-prod.yml/env -> validated Spring config
Flyway -> PostgreSQL schema -> Hibernate validate
/api/actuator/health/readiness -> Docker/CD checks
```

## Related code files

- Modify `service/lenshub/build.gradle`.
- Modify `service/lenshub/src/main/resources/application.yml`.
- Modify `service/lenshub/src/main/java/org/web/configs/SecurityConfig.java`.
- Create `service/lenshub/src/main/resources/application-prod.yml`.
- Create `service/lenshub/src/main/resources/db/migration/V1__baseline.sql`.
- Create/update config tests under `service/lenshub/src/test`.

## Implementation Steps

1. Add Actuator and Flyway PostgreSQL dependencies compatible with Spring Boot BOM.
2. Remove real MinIO fallback values; require secrets through environment.
3. Add production profile: `ddl-auto=validate`, SQL init disabled, health probes enabled.
4. Permit only health readiness/liveness endpoints; no environment/config exposure.
5. Determine database path:
   - Empty PROD: generate and review V1 schema baseline.
   - Existing PROD: backup, run Flyway baseline at verified version, then add V2+ migrations.
6. Define backward-compatible expand/contract migration rule.
7. Add config/startup tests for missing secrets and production profile.

## Todo list

- [x] Support empty DB plus explicit non-empty DB baseline path.
- [x] Add Actuator/Flyway.
- [x] Remove unsafe secret defaults.
- [x] Add PROD profile.
- [x] Create/reconcile baseline.
- [x] Validate health and migration tests.

## Success Criteria

- `SPRING_PROFILES_ACTIVE=prod` starts only with required secrets.
- Fresh database migrates then Hibernate validates.
- Existing database baseline path rehearsed on copy.
- Health returns `200` healthy and no sensitive details.
- Backend test suite passes.

## Risk Assessment

| Failure mode | Probability | Impact | Mitigation/Rollback |
| --- | --- | --- | --- |
| Baseline mismatches entities | Medium | High | Compare schema dump; rehearse on copy; restore DB |
| Breaking migration blocks old image | Medium | High | Expand/contract only; rollback migration before release |
| Health route exposed too broadly | Low | Medium | Expose status only; NGINX restrict detail endpoints |

## Security Considerations

- Separate JWT, activation JWT, MinIO, DB, Redis, FPT, VNPay, SMTP secrets.
- Minimum 256-bit random JWT secrets.
- Never print configuration or FPT payloads containing PII.
- Swagger disabled or access-restricted in PROD.

## Next steps

Proceed to Phase 02 only after schema baseline and production startup are repeatable.
