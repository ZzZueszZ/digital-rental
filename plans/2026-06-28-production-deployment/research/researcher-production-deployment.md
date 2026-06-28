# Research: LensHub Production Deployment

**Date:** 2026-06-28
**Scope:** single VPS, GHCR CI/CD, public MinIO S3 API, offsite backup

## Findings

### Container registry and delivery

- GHCR supports OCI/Docker images, repository-linked permissions, `GITHUB_TOKEN` publishing, private package pulls through scoped credentials.
- GitHub recommends pinning third-party Actions by commit SHA.
- Publish immutable commit tag and capture pushed digest. Deploy digest, not mutable `latest`.
- VPS requires only read-only `read:packages` token. CI build stays on GitHub runner, saving VPS RAM/disk.

### Docker Compose production

- Compose is supported for production and fits one-node topology.
- `docker compose pull` separates image retrieval from container start.
- Health checks plus `depends_on.condition: service_healthy` prevent backend starting before PostgreSQL/Redis/MinIO readiness.
- `pull_policy: always` supports registry-driven deployments, but explicit digest remains rollback source.

### Public MinIO

- MinIO recommends dedicated DNS for S3 API behind reverse proxy.
- NGINX must preserve `Host`, use HTTP/1.1, disable request/response buffering, and allow required upload size.
- Public endpoint does not require public bucket. Keep bucket private; clients use presigned URLs or scoped S3 credentials.
- `https://storage.lenshub.shop` is required for browser use from HTTPS frontend. Raw `http://VPS_IP:9000` causes mixed-content and certificate problems.
- Console port `9001` should remain loopback-only and accessed by SSH tunnel.

### Backup

- PostgreSQL `pg_dump` produces consistent logical snapshots without blocking normal database work; custom format enables selective `pg_restore`.
- MinIO `mc mirror` can copy current objects to S3-compatible storage, but does not preserve version history. Backup flow must separately preserve deleted/overwritten objects.
- Cloudflare R2 supports S3 clients and bucket-scoped credentials.
- R2 Standard currently includes 10 GB-month free, then USD 0.015/GB-month; direct egress is free.
- Recommended: encrypted R2 target, daily PostgreSQL dumps, nightly MinIO sync with dated backup directory, restore drill monthly.

## Decision Summary

- Registry: private GHCR package `ghcr.io/zzzueszz/digital-rental-backend`.
- Deployment: GitHub Actions SSH trigger; VPS pulls immutable digest. No Watchtower.
- Edge: host NGINX + Certbot.
- MinIO: S3 API public through `storage.lenshub.shop`; no direct public `9000/9001`.
- Backup: Cloudflare R2 Standard; RPO 24 hours, RTO 4 hours.
- Primary objects retained until explicit application/user deletion.
- Deleted/overwritten backup objects retained 30 days.

## Sources

- [GitHub Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub publishing Docker images](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)
- [Docker Compose pull](https://docs.docker.com/reference/cli/docker/compose/pull/)
- [MinIO NGINX proxy setup](https://min.io/docs/minio/linux/integrations/setup-nginx-proxy-with-minio.html)
- [MinIO mc mirror](https://docs.min.io/aistor/reference/cli/mc-mirror/)
- [PostgreSQL SQL dump](https://www.postgresql.org/docs/current/backup-dump.html)
- [Cloudflare R2 S3 API](https://developers.cloudflare.com/r2/get-started/s3/)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)

## Unresolved Questions

- Confirm DNS records `api.lenshub.shop` and `storage.lenshub.shop` can be created.
- Confirm production database starts empty or contains existing data requiring Flyway baseline.
- Confirm VPS OS; plan assumes Ubuntu 24.04 LTS or 22.04 LTS.
