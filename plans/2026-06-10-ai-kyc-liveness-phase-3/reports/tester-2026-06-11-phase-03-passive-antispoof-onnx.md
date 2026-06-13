# Test Results Report: Phase 3 Passive Anti-Spoof ONNX

**Date:** 2026-06-11

## Test Results Overview

- Total tests: 38
- Passed: 38
- Failed: 0
- Skipped: 0
- Command: `.\.venv\Scripts\python -m pytest`

## Build Status

- Command: `.\.venv\Scripts\python -m compileall app tests`
- Status: passed

## Scope

- Missing anti-spoof model path fails closed.
- Mocked ONNX session produces deterministic live scores.
- Aggregation uses percentile 25.
- High scores pass anti-spoof.
- Liveness response keeps Java-compatible `data` object.

## Critical Issues

- None.

## Unresolved Questions

- [ ] Exact ONNX model and license still not pinned.
- [ ] Runtime model preprocessing must be verified with chosen model.
