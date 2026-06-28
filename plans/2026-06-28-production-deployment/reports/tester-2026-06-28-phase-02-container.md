# Test Report: Phase 02 Backend Container

**Date:** 2026-06-28
**Status:** PASS WITH DEFERRED VALIDATION

## Passed

- Container contract test passed before final syntax digest assertion.
- Multi-stage image built from clean Docker context for `linux/amd64`.
- Image architecture: Linux amd64.
- Runtime: Java 17.0.19 JRE.
- Runtime user: `10001:10001`, verified non-root.
- Heap contract: `-Xms256m -Xmx768m`.
- Readiness healthcheck present; `wget` present.
- JAR readable by runtime user.
- Image size: 181,517,454 bytes.
- OCI source and revision labels present.
- No secret patterns found in image history.

## Deferred by User

- Second build cache timing.
- Full container startup against PostgreSQL/Redis/MinIO.
- Docker `healthy` transition.
- Peak memory sampling and read-only filesystem/tmpfs test.
- Docker Scout CVE scan.
- Contract-test rerun after syntax directive digest pin.

## Unresolved Questions

- Deferred checks must run in Phase 03 or CI before production release.
