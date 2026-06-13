# Test Results Report: Phase 1 Input Video Sampling

**Date:** 2026-06-10

## Test Results Overview

- Total tests: 30
- Passed: 30
- Failed: 0
- Skipped: 0
- Command: `.\.venv\Scripts\python -m pytest`

## Build Status

- Command: `.\.venv\Scripts\python -m compileall app tests`
- Status: passed

## Scope

- API contract still returns `data.score`, `data.passed`, `data.spoof_detected`, `data.multiple_faces_detected`.
- Liveness rejects fake signature, bad extension, oversized upload, invalid metadata, short/long videos, low FPS, low resolution.
- Valid synthetic AVI samples bounded frames and still fails closed until Phase 2 active pose.

## Critical Issues

- None.

## Unresolved Questions

- [ ] Need real FE video samples for Phase 2 tuning.
