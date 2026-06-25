# Implementation Plan: FPT KYC Direct Response Mapping

**Date:** 2026-06-26
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** Low
**Estimated Effort:** 1 hour

## Overview

Fix FPT KYC parser when response has top-level `liveness` and `face_match` objects instead of `data`.

## Problem Statement

Current `FptKycProvider` reads `root.path("data")` for facematch/liveness. User payload has no `data`, so mapped result becomes defaults/null-like values.

## Goals & Success Metrics

- [x] Parse wrapped `data` response as before.
- [x] Parse direct `face_match` response.
- [x] Parse direct `liveness` response.
- [x] Add focused unit tests for direct payload.

## Proposed Solution

Add response-node selection helpers in `FptKycProvider`:

- Facematch: prefer `data`, fallback `face_match`, fallback root.
- Liveness: prefer `data`, fallback `liveness`, fallback root.
- Convert `spoof_prob` to a live score when explicit score missing.

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Different FPT schema field casing | Med | Med | Keep existing fields, add direct-shape fields only |
| Liveness score policy mismatch | Low | Med | Preserve existing risk threshold, derive score from `spoof_prob` |

## Testing Strategy

- Unit test direct facematch payload maps similarity and match flag.
- Unit test direct combined payload maps liveness pass, score, spoof flag.
- `./gradlew compileJava` passed.
- `./gradlew test` blocked by unrelated existing `SessionKeyStoreTest` compile errors.

## Unresolved Questions

- None.
