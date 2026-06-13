# Test Results Report: Phase 2 Active Pose Liveness

**Date:** 2026-06-10

## Test Results Overview

- Total tests: 35
- Passed: 35
- Failed: 0
- Skipped: 0
- Command: `.\.venv\Scripts\python -m pytest`

## Build Status

- Command: `.\.venv\Scripts\python -m compileall app tests`
- Status: passed

## Scope

- Active pose scorer passes `center -> left -> right -> center`.
- Wrong order fails.
- Multiple faces fail.
- Low valid-face ratio fails.
- Face out of frame fails.
- Missing MediaPipe model path fails closed with explicit diagnostics.

## Critical Issues

- None.

## Unresolved Questions

- [ ] Need real `face_landmarker.task` model path to test runtime MediaPipe detection.
- [ ] Need real FE videos to tune yaw thresholds.
