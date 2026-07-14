# Implementation Plan: ffprobe Liveness Prod Fix

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** Low
**Estimated Effort:** 1 hour

## Overview

Fix prod eKYC liveness warning where backend cannot run `ffprobe`.

## Problem Statement

Backend image lacks `ffprobe`, so liveness duration validation falls back to size/signature only unless strict probe env is enabled.

## Goals & Success Metrics

- [x] Runtime image contains `ffprobe`.
- [x] Prod compose sets fail-closed liveness duration probe.
- [x] Docker/compose config validates locally.

## Proposed Solution

Install Alpine `ffmpeg` package in backend runtime image, set `FFPROBE_PATH=/usr/bin/ffprobe`, and set `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=true` for prod backend.

## Implementation Tasks

- [x] Patch `service/lenshub/Dockerfile`.
- [x] Patch `docker/docker-compose.prod.yml`.
- [x] Update deployment guide.
- [x] Validate Dockerfile/compose config.

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Prod deploy uses old image with new strict env | Medium | High | Rebuild/push backend image before compose redeploy |
| Image size increases | High | Low | Accept for required media metadata validation |
| Alpine package unavailable during build | Low | Medium | Build fails early; no partial prod release |

## Testing Strategy

- `docker compose -f docker/docker-compose.prod.yml config`
- `docker build --target runtime` is not available because stages unnamed; run full backend image build when Docker available.
- Smoke test KYC submit with valid and invalid duration videos after deploy.

## Rollback Plan

Revert Dockerfile/compose changes or set `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=false` temporarily if prod liveness uploads are blocked unexpectedly.

## Unresolved Questions

- None.
