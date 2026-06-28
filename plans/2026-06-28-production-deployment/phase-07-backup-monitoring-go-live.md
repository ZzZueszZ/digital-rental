# Phase 07: Backup, Monitoring, Documentation, and Go-Live

## Context links

- [Parent plan](plan.md)
- [Phase 06](phase-06-cd-deploy-rollback.md)
- [Backup research](research/researcher-production-deployment.md)
- `docs/deployment-guide.md`
- `docs/system-architecture.md`

## Overview

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** Pending
**Review Status:** Pending
Prove offsite recovery, add low-overhead monitoring, update source-of-truth docs, then release.

## Key Insights

- Same-VPS backup does not survive VPS loss.
- KYC media makes object backup larger and sensitive.
- `mc mirror` alone does not retain deleted/overwritten history.
- Restore tests, not backup job exit code, prove recoverability.

## Requirements

- Cloudflare R2 Standard, dedicated private bucket and scoped token.
- Client-side encrypted backup namespace.
- PostgreSQL custom-format dump daily.
- MinIO nightly sync; deleted/overwritten objects retained 30 days.
- DB retention: 7 daily, 4 weekly, 6 monthly.
- RPO 24 hours; RTO 4 hours.
- Monthly restore drill to isolated DB/bucket.
- External uptime checks and local disk/RAM alerts.

## Architecture

```text
02:00 PostgreSQL pg_dump -Fc -> encrypted R2/db
03:00 MinIO S3 -> encrypted R2/minio/current
                        `-> history/YYYY-MM-DD on replace/delete
monthly -> isolated restore -> integrity/smoke report
```

## Related code files

- Create `deploy/production/backup/backup-postgres.sh`.
- Create `deploy/production/backup/backup-minio.sh`.
- Create `deploy/production/backup/prune-backups.sh`.
- Create `deploy/production/backup/restore-drill.sh`.
- Create `deploy/production/backup/systemd/*.service`.
- Create `deploy/production/backup/systemd/*.timer`.
- Create `deploy/production/monitoring/check-host.sh`.
- Modify `docs/deployment-guide.md`.
- Modify `docs/system-architecture.md`.
- Modify `docs/project-roadmap.md`.
- Create/update `docs/project-changelog.md`.

## Implementation Steps

1. Create R2 bucket; issue token limited to that bucket.
2. Configure encrypted `rclone crypt` target over R2; secrets root-readable only.
3. Dump PostgreSQL using custom format; checksum; upload; verify remote object.
4. Sync MinIO current objects; move overwritten/deleted copies to dated history.
5. Guard mass deletion with maximum-delete threshold and manual intervention.
6. Apply DB and object-history retention; primary MinIO keeps objects until explicit delete.
7. Schedule systemd timers with failure notification.
8. Restore DB into isolated PostgreSQL and objects into scratch bucket monthly.
9. Run application smoke against restored data where feasible.
10. Configure external checks for API health and storage endpoint.
11. Alert at disk 70%/85%, RAM 80%, backup age >26 hours, certificate expiry.
12. Execute go-live checklist and update documentation.

## Todo list

- [ ] Create R2 bucket/token/encryption.
- [ ] Implement DB and MinIO backups.
- [ ] Implement retention and delete guard.
- [ ] Complete restore drill.
- [ ] Configure monitoring/alerts.
- [ ] Run go-live matrix.
- [ ] Update docs.

## Success Criteria

- Latest backup age under 26 hours.
- PostgreSQL restore passes row/schema checks.
- Random MinIO sample objects match checksums after restore.
- Complete rebuild rehearsal meets RTO 4 hours.
- External monitors detect intentional outage.
- Disk/RAM/certificate alerts reach owner.
- Production runbook reviewed and current.

## Risk Assessment

| Failure mode | Probability | Impact | Mitigation/Rollback |
| --- | --- | --- | --- |
| R2 token leak exposes PII | Low | High | scoped token, client encryption, rotation |
| Sync propagates accidental mass delete | Medium | High | backup-dir history, max-delete guard |
| Backup consumes VPS disk | Medium | High | stream/upload; no full local MinIO copy |
| Restore misses roles/extensions | Medium | High | dump globals separately; restore checklist |
| Indefinite primary retention fills disk | High | High | usage alerts; owner approves later lifecycle policy |

## Security Considerations

- KYC backup encrypted before leaving VPS.
- Restore environment isolated and erased after drill.
- Backup logs include object counts/checksums, never PII names or payloads.
- Document data deletion propagation: primary immediate, backup history after 30 days.

## Next steps

After all criteria pass, mark plan completed and schedule quarterly recovery review.

## Unresolved Questions

- Alert destination: email, Telegram, or another channel.
- Legal/business approval for 30-day deleted-object backup retention.
