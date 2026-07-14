# Documentation Update Report

Date: 2026-06-29

## Current State Assessment

Deployment guide now reflects the actual backend runtime dependency for liveness video duration validation.

## Changes Made

- Updated `docs/deployment-guide.md` date to `2026-06-29` and version to `1.3`.
- Added `FFPROBE_PATH` config.
- Added `REQUIRE_LIVENESS_VIDEO_DURATION_PROBE` config.
- Added backend container note that runtime installs `ffmpeg` for `ffprobe`.

## Gaps Identified

No additional doc changes required for this scoped prod bug fix.

## Recommendations

Keep prod release notes explicit: rebuild backend image before compose redeploy.

## Unresolved Questions

- None.
