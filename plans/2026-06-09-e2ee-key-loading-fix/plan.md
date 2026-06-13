# Implementation Plan: E2EE Key Loading Fix

**Date:** 2026-06-09
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** Low
**Estimated Effort:** 1 hour

## Overview

Fix backend startup failure when E2EE identity key env vars contain raw PEM instead of base64-wrapped PEM.

## Problem Statement

`ServerKeyConfig` always base64-decodes `SERVER_IDENTITY_PRIV_B64` and `SERVER_IDENTITY_PUB_B64` before PEM parsing. Raw PEM starts with `-----BEGIN`, so Java Base64 decode fails with `Illegal base64 character 2d`.

## Goals & Success Metrics

- [x] Raw PEM private/public env values load.
- [x] Base64-encoded PEM values still load.
- [x] Base64 DER values load.
- [x] Backend tests pass for E2EE key config.

## Proposed Solution

Normalize each env value once:

1. Convert escaped `\n` to real newlines and trim.
2. If PEM headers present, strip headers and decode PEM body.
3. Else base64-decode the env value.
4. If decoded bytes are PEM text, strip/decode PEM body.
5. Else treat decoded bytes as DER.

## Implementation Tasks

- [x] Update `ServerKeyConfig` parser.
- [x] Add regression test with generated EC P-256 keys.
- [x] Update deployment docs to document accepted formats.
- [x] Run backend test compile/test.

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Invalid key accepted | Low | High | Use Java `KeyFactory` to validate PKCS#8/X.509 bytes. |
| Existing env format broken | Low | High | Keep base64-encoded PEM behavior and add tests. |

## Testing Strategy

- Unit test raw PEM, base64 PEM, base64 DER.
- Run `.\gradlew test`.

## Rollback Plan

Revert `ServerKeyConfig`, new test, and docs edits.

## Unresolved Questions

None.
