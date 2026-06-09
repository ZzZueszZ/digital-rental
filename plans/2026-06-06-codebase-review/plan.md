# Implementation Plan: Codebase Review Improvements

**Date:** 2026-06-06
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Draft
**Complexity:** Medium
**Estimated Effort:** 3-5 days

## Overview

Fix high-risk production readiness issues found in codebase review: secrets/config, upload paths, CORS/payment URLs, frontend API client consistency, and validation tooling.

## Phases

| Phase | Status | Priority | Link |
| --- | --- | --- | --- |
| 01 Config and Secrets | Pending | Critical | [phase-01-config-and-secrets.md](phase-01-config-and-secrets.md) |
| 02 Backend Correctness | Pending | High | [phase-02-backend-correctness.md](phase-02-backend-correctness.md) |
| 03 Frontend API Consistency | Pending | High | [phase-03-frontend-api-consistency.md](phase-03-frontend-api-consistency.md) |
| 04 Validation and Docs | Pending | Medium | [phase-04-validation-and-docs.md](phase-04-validation-and-docs.md) |

## Research Links

- [Spring backend research](../reports/researcher-2026-06-06-spring-backend-production.md)
- [Next.js auth research](../reports/researcher-2026-06-06-nextjs-auth-client.md)
- [Code review report](../reports/code-review-2026-06-06-codebase-review.md)

## Success Metrics

- No committed real secrets or production default secrets.
- Backend tests pass.
- Frontend lint/build commands run successfully.
- All API calls use one auth-aware frontend client.
- Upload save/delete behavior covered by tests.

## Next Steps

1. Confirm whether to implement fixes now.
2. Start Phase 01 before touching feature code.
3. Re-run backend tests and frontend validation after each phase.

## Unresolved Questions

- Which secret manager/env deployment mechanism will production use?
- Should missing legacy modules be restored or intentionally removed?
