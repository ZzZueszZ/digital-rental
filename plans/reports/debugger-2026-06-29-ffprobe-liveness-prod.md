# Debugger Report: Prod ffprobe Liveness Warning

Date: 2026-06-29

## Summary

Prod backend logs `Cannot run program "ffprobe": error=2, No such file or directory` during eKYC submit.

Root cause likely: backend runtime image uses `eclipse-temurin:17-jre-alpine` and does not install `ffmpeg`, so `ffprobe` binary absent in container.

Impact: liveness video duration check is skipped when `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=false` or unset. Upload still uses file size + magic signature validation, but 4.5-7s duration rule not enforced for object-storage submit path.

## Evidence

- Log stack: `FileUploadUtil.probeVideoDurationSeconds` -> `ProcessBuilder.start` -> `error=2`.
- Dockerfile runtime stage has user/app setup only; no `apk add ffmpeg`.
- `FileUploadUtil` defaults `FFPROBE_PATH` to `ffprobe`.
- On `IOException`, code returns `OptionalDouble.empty()` unless `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=true`.
- `KycVerificationProcessor.validateLivenessVideo` validates object-storage liveness file before provider call.

## Fix Options

1. Recommended: install `ffmpeg` in backend runtime image.
   - Alpine package provides `ffprobe`.
   - Then set `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=true` in prod env after smoke test.

2. Config-only workaround: set `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=false`.
   - Current behavior already this by default.
   - Not real fix; keeps warning and weakens duration validation.

3. External binary mount: mount host `ffprobe` and set `FFPROBE_PATH`.
   - More brittle than baking dependency into image.
   - Host/container path and permissions easy fail.

4. Code alternative: Java media metadata library.
   - Avoids OS binary, but higher risk/new dependency.
   - Not needed for current prod incident.

## Recommended Action

Patch `service/lenshub/Dockerfile` runtime stage:

```dockerfile
RUN apk add --no-cache ffmpeg \
    && addgroup -S -g 10001 lenshub \
    && adduser -S -D -H -u 10001 -G lenshub lenshub \
    && mkdir -p /app \
    && chown -R lenshub:lenshub /app
```

Then in `docker/backend.prod.env` or actual prod env:

```env
REQUIRE_LIVENESS_VIDEO_DURATION_PROBE=true
```

Validate:

```powershell
docker run --rm <backend-image> ffprobe -version
docker compose -f docker/docker-compose.prod.yml up -d backend
docker logs lenshub_backend_prod --tail 200
```

Smoke test eKYC submit with a valid 5-6s liveness video and an invalid duration video.

## Unresolved Questions

- Is prod using image built from current `service/lenshub/Dockerfile`, or older image digest?
- Is actual prod env file named `docker/backend.prod.env`, and does it currently set `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE`?
- Do we want fail-closed immediately after image fix, or deploy binary first and enable strict duration in second deploy?
