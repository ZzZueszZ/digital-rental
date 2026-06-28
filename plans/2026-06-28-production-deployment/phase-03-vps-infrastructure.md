# Phase 03: VPS and Production Compose

## Context links

- [Parent plan](plan.md)
- [Phase 02](phase-02-backend-container.md)
- `docker/docker-compose.yml` as development reference only

## Overview

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** Pending
**Review Status:** Pending
Provision one hardened VPS and isolated production Compose stack.

## Key Insights

- One node is a SPOF; recovery quality matters more than orchestration.
- DB/Redis must never publish host ports.
- Backend and MinIO bind loopback so host NGINX is sole ingress.
- 80 GB requires log/image cleanup and disk alerts.

## Requirements

- Ubuntu LTS, Docker Engine + Compose plugin, host NGINX installed later.
- Public firewall: SSH, 80, 443 only.
- Compose services: backend, PostgreSQL 15, Redis 7, MinIO, one-shot MinIO init.
- Named volumes and health checks.
- Secrets in `/opt/lenshub/shared/.env`, mode `600`.
- 2 GiB swap and Docker log rotation.

## Architecture

```text
host loopback: backend 8080, MinIO API 9000, Console 9001
Docker private network: backend <-> postgres/redis/minio
public: host NGINX only
```

## Related code files

- Create `deploy/production/compose.yml`.
- Create `deploy/production/.env.example`.
- Create `deploy/production/scripts/bootstrap-vps.sh`.
- Create `deploy/production/scripts/check-capacity.sh`.
- Do not modify development Compose.

## Implementation Steps

1. Create non-root deploy user, SSH key auth, disable password/root SSH.
2. Configure UFW and unattended security updates.
3. Install Docker from official repository; enable daemon log limits.
4. Create `/opt/lenshub/{releases,shared,backup}` with strict ownership.
5. Create secrets using cryptographic random generation; store outside Git.
6. Define Compose resource limits and health-dependent startup.
7. PostgreSQL: private, persistent, `max_connections` near 50, conservative buffers.
8. Redis: password, persistence, 192 MiB, `noeviction`.
9. MinIO: private bucket, persistent volume, root credentials only for bootstrap.
10. Backend: GHCR image reference variable, 1 GiB memory, loopback port.
11. Start infra and verify no forbidden listening ports.

## Todo list

- [ ] Harden SSH/firewall.
- [ ] Install Docker and swap.
- [ ] Create directory/secrets.
- [ ] Add production Compose.
- [ ] Start and health-check infra.
- [ ] Verify port exposure and memory.

## Success Criteria

- External scan finds only approved ports.
- PostgreSQL, Redis, MinIO volumes survive container recreation.
- Backend reaches dependencies by Docker DNS.
- Normal idle host memory below 75%; disk below 70%.
- Restarting host restores stack automatically.

## Risk Assessment

| Failure mode | Probability | Impact | Mitigation/Rollback |
| --- | --- | --- | --- |
| Firewall locks out SSH | Medium | High | Keep second session; provider console; apply rules incrementally |
| Volume path/ownership wrong | Medium | High | Preflight write tests; backup before change |
| OOM kills DB/backend | Medium | High | Limits, swap, alerts, representative load test |
| Redis eviction revives blacklist tokens | Low | High | `noeviction`, TTL monitoring |

## Security Considerations

- Docker group is root-equivalent; deploy user dedicated and key restricted.
- Never place application secrets in GitHub workflow logs.
- Root MinIO key never issued to browser/tool users.
- Database superuser used only for administration/migration.

## Next steps

Proceed to public edge only after private stack passes restart and capacity tests.
