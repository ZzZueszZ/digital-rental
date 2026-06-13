# Implementation Plan: AI KYC Face Match Phase 2

**Date:** 2026-06-10
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Completed
**Complexity:** Medium
**Estimated Effort:** 4-6 hours

## Overview

Implement real CPU-only face matching for `service/ai-kyc-service` endpoint `POST /dmp/checkface/v1`, keeping the FPT-compatible response used by the existing Spring backend.

## Requirements

- Accept header `api_key` and multipart `file[]` exactly twice.
- Return `{ "data": { "similarity": number, "isMatch": boolean } }`.
- Reject/close-fail with `similarity = 0`, `isMatch = false` when images invalid, no model, no face, or multiple faces.
- Detect exactly one usable face per image.
- Use InsightFace + ONNX Runtime CPU provider for detection, alignment, and embeddings.
- Use cosine similarity mapped to `0..100`; initial threshold `80`.

## Design

Data flow:

1. FastAPI reads two image uploads.
2. `FaceMatchService` validates image count and image quality.
3. Lazy singleton `InsightFaceMatcher` loads `FaceAnalysis` once with `CPUExecutionProvider`.
4. Each image decodes via OpenCV, detects faces, requires exactly one face with embedding.
5. Normalize embeddings, compute cosine, map to score.
6. Return FPT-compatible payload.

## Files

- `service/ai-kyc-service/app/services/face_match_service.py`
- `service/ai-kyc-service/app/api/face_match.py`
- `service/ai-kyc-service/app/config.py`
- `service/ai-kyc-service/requirements.txt`
- `service/ai-kyc-service/tests/test_face_match_service.py`
- `service/ai-kyc-service/tests/test_api_contracts.py`

## Implementation Tasks

- [x] Replace perceptual fallback with model-first fail-closed behavior.
- [x] Add lazy cached InsightFace initialization with CPU provider.
- [x] Add structured diagnostics in response/logs without breaking `data` contract.
- [x] Add unit tests with fake matcher for match, non-match, no face, bad image count.
- [x] Keep existing API contract tests passing.
- [x] Rebuild Docker and smoke-test endpoint.

## Risks

- InsightFace model download can be slow or blocked. Mitigation: lazy init and clear `model_unavailable` diagnostic.
- Threshold scale may differ from FPT. Mitigation: configurable `KYC_AI_FACE_MATCH_THRESHOLD`, default 80, tune later with internal set.
- CPU latency can be high. Mitigation: singleton model instance, no per-request prepare.
- PII/image data in logs. Mitigation: log metadata only, no raw image bytes.

## Success Criteria

- Tests pass.
- Endpoint remains backward-compatible for Spring `FptKycProvider`.
- No-face/multiple-face/model-missing cases do not produce false positive match.
- With real model installed, score derives from face embeddings, not whole-image perceptual hash.

## Unresolved Questions

- Need internal positive/negative face test set to tune threshold.
