# Phase 01: Config and Secrets

## Context Links

- `service/lenshub/src/main/resources/application.yml`
- `docker/docker-compose-dev.yml`
- `plans/reports/researcher-2026-06-06-spring-backend-production.md`

## Overview

**Date:** 2026-06-06
**Priority:** Critical
**Status:** Pending

Remove exposed secrets and separate local defaults from production config.

## Key Insights

- Current config includes mail password, DB password, fallback JWT secret, fallback activation secret.
- SQL logging and `ddl-auto=update` are acceptable for local dev only.

## Requirements

- Rotate exposed Gmail/JWT/activation credentials.
- Keep local setup easy with `.env.example`.
- Production must fail fast if required secrets are missing.

## Architecture

Use profile-specific Spring config:

- `application.yml`: non-secret shared defaults.
- `application-local.yml`: local-only DB/log defaults.
- `application-prod.yml`: env-required values, schema validate/none.

## Related Code Files

- `service/lenshub/src/main/resources/application.yml`
- `service/lenshub/build.gradle`
- `docker/docker-compose-dev.yml`

## Implementation Steps

1. Move secret-like defaults out of committed config.
2. Add `.env.example` with placeholder names only.
3. Add prod profile values for JPA/logging.
4. Decide Flyway or Liquibase before schema migrations.

## Todo List

- [ ] Rotate exposed credentials.
- [ ] Split local/prod config.
- [ ] Add `.env.example`.
- [ ] Disable SQL parameter logging outside local.

## Success Criteria

- `rg "wpri|change-me|C5EH86|password: 123123" service/lenshub/src/main/resources` has no prod-risk hits.
- Backend starts locally with documented env/local profile.

## Risk Assessment

- High: breaking local startup. Mitigate with `.env.example` and README update.

## Security Considerations

Secrets must not be committed. JWT signing secrets must be strong and environment-specific.

## Next Steps

Start here before backend or frontend behavior changes.
