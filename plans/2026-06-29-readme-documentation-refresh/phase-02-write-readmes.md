# Phase 02: Write Root and Project READMEs

## Context Links

- Parent plan: [plan.md](plan.md)
- Phase 01: [phase-01-readme-structure.md](phase-01-readme-structure.md)

## Overview

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** Complete
**Review Status:** Passed - 0 critical issues

Rewrite README files according to Phase 01 contract.

## Key Insights

- `frontend/README.md` must remove boilerplate.
- `service/lenshub/README.md` must be created.
- `service/ai-kyc-service/README.md` needs clean encoding and repo-relative examples.

## Requirements

- Root README: product overview, repo map, quick start, docs index, deployment pointers.
- Frontend README: scripts, env vars, route groups, API integration, E2EE flags.
- Backend README: local infra, env, Gradle commands, API docs, tests, Docker, prod notes.
- AI KYC README: endpoints, venv/Docker, model setup, backend integration, tests, troubleshooting.

## Architecture

No runtime architecture change. Documentation-only.

## Related Code Files

- `README.md`
- `frontend/README.md`
- `service/lenshub/README.md`
- `service/ai-kyc-service/README.md`

## Implementation Steps

1. Rewrite root README first.
2. Rewrite frontend README from actual `package.json` and `.env.example`.
3. Create backend README from `build.gradle`, `application*.yml`, `Dockerfile`, docs.
4. Rewrite AI KYC README from current endpoints/config/tests while removing stale absolute paths.

## Todo List

- [x] Root README updated.
- [x] Frontend README updated.
- [x] Backend README created.
- [x] AI KYC README cleaned.

## Success Criteria

- New developer can identify which project to run.
- Commands match actual scripts.
- No corrupted text remains in AI KYC README.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Losing AI model nuance | Medium | Medium | Preserve endpoint/model/troubleshooting details |
| Secret leakage | Low | High | Use examples/placeholders only |

## Security Considerations

Document secret handling without listing real credentials.

## Next Steps

Proceed to Phase 03.
