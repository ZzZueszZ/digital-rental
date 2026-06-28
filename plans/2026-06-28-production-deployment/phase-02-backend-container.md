# Phase 02: Backend Container

## Context links

- [Parent plan](plan.md)
- [Phase 01](phase-01-production-safety.md)
- `service/lenshub`

## Overview

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** DONE_WITH_CONCERNS (2026-06-28)
**Review Status:** APPROVED_WITH_DEFERRED_VALIDATION
Create small, non-root, reproducible Spring Boot image.

**Progress:** Steps 3-5 complete with user waiver - image build/inspection passed; runtime/CVE checks deferred.

## Key Insights

- VPS must pull, not compile.
- Java heap needs explicit ceiling on 4 GB host.
- Image needs health tooling or JVM-native health check.
- Build context must exclude Gradle caches, uploads, env, reports.

## Requirements

- Multi-stage Java 17 build.
- Run as non-root.
- No source, Gradle cache, secrets, or `.env` in runtime image.
- Runtime heap `-Xms256m -Xmx768m`.
- OCI source/revision labels.
- Image supports amd64 VPS.

## Architecture

```text
Gradle builder -> tested bootJar -> Java 17 JRE runtime -> non-root backend
```

## Related code files

- Create `service/lenshub/Dockerfile`.
- Create `service/lenshub/.dockerignore`.
- Create `service/lenshub/src/test/.../ProductionContainerConfigTest.java` if needed.
- No production Compose changes in this phase.

## Implementation Steps

1. Pin builder/runtime base images by maintained Java 17 distribution and version.
2. Copy Gradle wrapper/build metadata first for cache efficiency.
3. Build `bootJar`; CI tests remain separate gate.
4. Copy one JAR into minimal JRE image.
5. Add non-root UID/GID, writable temp directory, `prod` profile defaults.
6. Add health check against readiness endpoint.
7. Build locally and inspect layers, user, ports, and secret absence.
8. Run container against disposable PostgreSQL/Redis/MinIO.

## Todo list

- [x] Add Dockerfile and ignore file.
- [ ] Build image twice to verify caching. Deferred by user.
- [x] Run as non-root.
- [ ] Verify heap and temp file cleanup. Heap configured; runtime sampling deferred.
- [x] Verify health check contract. Runtime transition deferred.
- [ ] Scan image for critical vulnerabilities. Deferred by user.

## Success Criteria

- Clean checkout builds image without host JDK.
- Container starts as non-root.
- `docker inspect` reports healthy within 120 seconds.
- Runtime image contains no `.env` or credentials.
- Peak backend container memory stays under 1 GiB in smoke test.

## Risk Assessment

| Failure mode | Probability | Impact | Mitigation/Rollback |
| --- | --- | --- | --- |
| Base image architecture mismatch | Low | High | Build `linux/amd64`; inspect manifest |
| POI/upload workload exceeds heap | Medium | High | Load test representative files; cap request sizes |
| Non-root temp write fails | Medium | Medium | Explicit owned temp directory |

## Security Considerations

- Pin production image versions; update deliberately.
- Do not bake secrets into `ARG`, `ENV`, or layers.
- Read-only root filesystem if temp paths verified.
- Drop Linux capabilities in Compose.

## Next steps

Phase 03 consumes this image contract. Phase 05 automates its build and publication.
