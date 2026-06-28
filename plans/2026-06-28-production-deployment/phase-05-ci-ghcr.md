# Phase 05: CI and GHCR Publication

## Context links

- [Parent plan](plan.md)
- [Phase 02](phase-02-backend-container.md)
- [GitHub registry research](research/researcher-production-deployment.md)

## Overview

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** High
**Implementation Status:** In Progress
**Review Status:** Pending
Run quality gates and publish immutable backend images to private GHCR.

**Workflow Progress:** Steps 0-2 complete. Step 3 blocked by 3 pre-existing
`ProductionProfileConfigTest` failures because `application-prod.yml` is absent.
Actionlint, frontend lint/build, and local `linux/amd64` image build pass.

## Key Insights

- Repository currently has no GitHub Actions.
- CI should build on GitHub runners, not 4 GB VPS.
- `latest`/`prod` tags are mutable; rollback needs SHA/digest.
- Frontend remains Vercel-managed but still needs lint/build gate.

## Requirements

- Every branch push: backend tests; frontend lint/build.
- Push to `master`, including pull-request merges: run gates, then build/push
  backend image.
- Image tags: `sha-<full-sha>` and `prod`; capture digest.
- GHCR uses `GITHUB_TOKEN`, `packages: write`, `contents: read`.
- Third-party actions pinned to commit SHA.
- No production SSH or app secrets in build job.

## Architecture

```text
branch push -> tests only
master push/merge -> tests -> Docker buildx -> GHCR image tags + immutable digest
```

## Related code files

- Create `.github/workflows/ci.yml`.
- Create `.github/workflows/production.yml` with test/build-push jobs; deploy job added Phase 06.
- Optional create `.github/dependabot.yml` for Actions/Docker updates.

## Implementation Steps

1. Configure Java 17 and Gradle caches; run backend tests.
2. Configure pnpm/Node matching frontend; run lint and production build.
3. Build backend image for `linux/amd64`.
4. Log in to GHCR with short-lived `GITHUB_TOKEN`.
5. Add OCI labels linking source/revision.
6. Push SHA and `prod` tags after all tests pass.
7. Record image digest as job output/artifact for deploy job.
8. Configure GHCR package visibility private and repository access.
9. Add concurrency group so older production runs cancel before deploy.

## Todo list

- [x] Add branch-push CI.
- [x] Add master build/publish.
- [x] Pin Actions SHAs.
- [x] Configure GHCR workflow permissions.
- [x] Verify failed tests prevent push.
- [ ] Verify digest output in an authenticated master run.

## Success Criteria

- A pushed branch cannot report green when backend tests or frontend build fail.
- Master pipeline publishes one image associated with commit SHA.
- Pulling by digest returns exact tested image.
- Workflow logs contain no credentials.
- VPS read-only token can pull; cannot push/delete package.

## Risk Assessment

| Failure mode | Probability | Impact | Mitigation/Rollback |
| --- | --- | --- | --- |
| Package permission blocks VPS pull | Medium | High | Rehearse token/package access before go-live |
| Mutable tag deploys wrong code | Medium | High | Deploy digest only |
| Compromised Action steals token | Low | High | Pin SHA; minimal permissions |
| Frontend build exceeds CI limits | Low | Medium | pnpm cache; split jobs |

## Security Considerations

- Use GitHub environment `production` for deploy secrets.
- GHCR pull PAT scoped `read:packages` only and stored on VPS.
- Add artifact provenance/attestation if supported without blocking MVP.
- Do not pass `.env` into Docker build context.

## Next steps

Phase 06 extends production workflow with health-gated VPS deployment.
