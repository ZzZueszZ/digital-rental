# Debugger Report: FPT KYC Direct Response Mapping

## Executive Summary

FPT response sample has top-level `liveness` and `face_match`. Current parser only reads `data`, causing default values when `data` missing.

## Root Cause

`FptKycProvider.verifyLiveness` and `checkFace` call `objectMapper.readTree(raw).path("data")`. `path("data")` returns missing node for direct FPT shape.

## Recommendation

Use schema fallback:

- `data` for existing wrapped provider and local AI service.
- `face_match` for direct facematch response.
- `liveness` for direct liveness response.
- root as final fallback.

## Unresolved Questions

- None.
