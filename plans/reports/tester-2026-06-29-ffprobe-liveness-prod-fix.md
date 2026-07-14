# Test Results Report

Date: 2026-06-29

## Test Results Overview

- Docker build: passed.
- Backend compile: passed via Docker `bootJar`.
- Targeted unit test: passed, `.\gradlew test --tests org.web.common.utils.FileUploadUtilTest`.
- Runtime binary check: passed, `docker run --rm --entrypoint ffprobe lenshub-backend:ffprobe-fix -version`.
- Compose config: passed with temporary empty `docker/backend.prod.env`; real prod env file is not committed.

## Build Status

- Status: success.
- Warnings: existing Java compile warnings about deprecated API and unchecked operations. Not introduced by this fix.

## Critical Issues

None.

## Recommendations

1. Rebuild and push backend image before applying updated prod compose.
2. Smoke test eKYC submit with valid 5-6s video and invalid duration video after deploy.

## Unresolved Questions

- None.
