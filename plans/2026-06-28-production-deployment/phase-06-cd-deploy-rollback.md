# Phase 06: CD, Pull Deployment, and Rollback

## Context links

- [Parent plan](plan.md)
- [Phase 03](phase-03-vps-infrastructure.md)
- [Phase 04](phase-04-edge-minio-tls.md)
- [Phase 05](phase-05-ci-ghcr.md)

## Overview

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** Pending
**Review Status:** Pending
Make VPS pull tested image digest, deploy safely, and rollback failed releases.

## Key Insights

- One VPS cannot provide true HA; target controlled short restart.
- Deploy must not overwrite last known good digest until smoke succeeds.
- Database migrations can make app rollback unsafe without expand/contract.
- Watchtower-style blind polling lacks test, approval, and rollback context.

## Requirements

- Trigger only after successful master test/build.
- SSH host key pinned; deploy user restricted.
- VPS logs into GHCR locally and pulls exact digest.
- Serial production deployments.
- Health timeout 120 seconds plus external smoke tests.
- Automatic rollback to prior successful digest.
- Manual `workflow_dispatch` supports redeploy/rollback digest.

## Architecture

```text
GHCR digest -> GitHub production job -> SSH
  -> save current digest
  -> compose pull backend
  -> compose up backend
  -> readiness + API/storage smoke
  -> commit new last-successful digest
  `-> on failure restore previous digest
```

## Related code files

- Modify `.github/workflows/production.yml`.
- Create `deploy/production/scripts/deploy.sh`.
- Create `deploy/production/scripts/smoke-test.sh`.
- Create `deploy/production/scripts/rollback.sh`.
- Create `deploy/production/runbook.md`.

## Implementation Steps

1. Add GitHub production environment and secrets: host, user, SSH key, pinned host key.
2. Install VPS GHCR read token using non-interactive Docker login.
3. Deploy script validates digest format and free disk/RAM before pull.
4. Save current successful digest to protected state file.
5. Set `BACKEND_IMAGE` to new digest; pull and recreate backend only.
6. Wait for Docker health; test public health, auth-safe API, MinIO health.
7. Confirm database migration success and FPT configuration presence without exposing values.
8. Mark digest successful, prune old unreferenced images after success.
9. On any failure, restore previous digest and rerun health/smoke.
10. Alert and fail workflow even when rollback succeeds.
11. Rehearse bad-image and failed-health rollback.

## Todo list

- [ ] Configure production environment/secrets.
- [ ] Implement deploy/smoke/rollback scripts.
- [ ] Add deploy job.
- [ ] Test concurrent-run lock.
- [ ] Rehearse rollback.
- [ ] Document manual recovery.

## Success Criteria

- Commit-to-healthy deployment completes within 10 minutes.
- Failed readiness restores prior image within 5 minutes.
- No app/DB/MinIO secret crosses command output.
- Two concurrent pushes cannot interleave deployments.
- Manual rollback by digest works.

## Risk Assessment

| Failure mode | Probability | Impact | Mitigation/Rollback |
| --- | --- | --- | --- |
| SSH/CD credential compromised | Low | High | Environment secrets, key rotation, restricted user |
| New migration incompatible with old app | Medium | High | Expand/contract; migration review gate |
| Disk fills during pull | Medium | High | Capacity precheck; keep current+previous only |
| Health green but feature broken | Medium | High | representative API/storage smoke tests |
| Rollback digest missing | Low | High | retain previous image/digest; test registry pull |

## Security Considerations

- Never disable SSH host verification.
- Validate image digest input; no shell interpolation from branch/user text.
- Production environment may require manual approval.
- Deploy scripts use `set -Eeuo pipefail` and restrictive file permissions.

## Next steps

Phase 07 proves recoverability and completes go-live.
