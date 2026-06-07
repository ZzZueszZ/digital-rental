# Research Report: Spring Backend Production Review

**Date:** 2026-06-06
**Research Question:** What Spring Boot/Security practices matter for this API review?

## Executive Summary

Ranked fixes: externalize secrets first, lock production DB schema management, then normalize CORS and payment redirects. These match official Spring guidance and current code risks.

## Key Findings

### Externalized configuration

- Spring Boot supports env vars, command-line args, config files, and vault-style external config for same code across environments.
- Fit: replace committed mail/database/JWT defaults with env-required properties and `.env.example`.
- Source: https://docs.spring.io/spring-boot/reference/features/external-config.html

### CORS and Spring Security

- Spring Security requires CORS to run before security because preflight requests lack cookies.
- Fit: keep a single `CorsConfigurationSource` path, configured by environment, not duplicated with MVC CORS.
- Source: https://docs.spring.io/spring-security/reference/7.0/servlet/integrations/cors.html

### Database initialization

- Spring Boot exposes `ddl-auto`, but also supports higher-level migration tools Flyway and Liquibase.
- Fit: use `ddl-auto=validate` or `none` in production and versioned migrations for schema changes.
- Source: https://docs.spring.io/spring-boot/how-to/data-initialization.html

## Recommendations

1. **Critical:** remove committed secrets/default secrets; require env values in prod.
2. **High:** create profile-specific config: local allows `ddl-auto=update`; prod uses migration/validate.
3. **High:** centralize CORS origins and frontend redirect URL in config.
4. **Medium:** return safe payment callback messages; avoid exposing exception text.

## Alternatives

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Env-required secrets | Simple, native Spring | Startup fails if missing | Best fit |
| Vault | Strong secret management | More infra | Future, not first pass |
| Hibernate update | Fast dev | Unsafe prod drift | Dev only |
| Flyway/Liquibase | Audit trail | Requires migration discipline | Preferred prod |

## Unresolved Questions

- Which production secret manager will be used?
- Is Flyway or Liquibase preferred by the team?
