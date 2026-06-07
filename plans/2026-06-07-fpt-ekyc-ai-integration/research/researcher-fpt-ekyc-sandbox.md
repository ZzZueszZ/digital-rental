# Research Report: FPT eKYC Sandbox Integration

**Date:** 2026-06-07
**Research Question:** What is required to integrate FPT ID OCR, Facematch, and Liveness into LensHub KYC MVP?

## Executive Summary

Use FPT.AI as primary MVP provider because it has official Vietnamese ID Recognition, Facematch, and Liveness APIs. Keep manual review in Phase 1/2; auto approve only after provider responses and risk scoring are stable.

## Key Findings

### FPT ID Recognition fits CCCD OCR

- Endpoint: `POST https://api.fpt.ai/vision/idr/vnm/`.
- Auth: `api-key` header from FPT console.
- Body: multipart form-data with `image`.
- Input: clear Vietnamese ID, visible/readable fields, <= 5MB, approx min 640x480, card area >= 1/4 image.
- Response includes extracted fields and confidence probabilities.
- Source: https://docs.fpt.ai/docs/en/vision/api/id-recognition

### FPT Facematch covers selfie vs ID portrait

- Endpoint: `POST https://api.fpt.ai/dmp/checkface/v1/`.
- Auth: `api_key` header.
- Body: append `file[]` twice.
- Constraints: jpg/jpeg, <= 5MB, approx min 640x480, face area >= 1/4 image.
- Response includes `isMatch`, `similarity`, and uses 80% threshold in docs.
- Source: https://docs.fpt.ai/docs/en/vision/api/face-match

### FPT Liveness should be Phase 2

- Video requirements: <= 10MB, at least 25fps, 720p, 5-6s, one frontal face, no occlusion/backlight/out-of-focus.
- Optional attached image compare requires <= 5MB, min 800x600.
- Pricing public doc: under 10,000 requests/month is 1,000 VND/request; over 10,000 contact FPT.
- Source: https://docs.fpt.ai/docs/en/vision/api/liveness
- Source: https://docs.fpt.ai/docs/en/vision/documentation/liveness-pricing

### Provider alternatives

| Option | Fit | Pros | Cons | Verdict |
| --- | --- | --- | --- | --- |
| FPT.AI | High | Vietnamese ID OCR docs, face APIs, local provider | Need API key/billing; sandbox terms unknown | Rank 1 |
| VNPT eKYC | High | Public packages, NFC support | Integration docs less visible in current scan | Rank 2 |
| AWS Rekognition | Medium | Mature liveness, clear pay/check pricing | Not CCCD OCR-native | Use only if FPT liveness blocked |

## Recommendations

1. Add provider abstraction first.
   - Rationale: keep `MockKycProvider` for dev/test and `FptKycProvider` for sandbox.
   - Trade-off: more classes, but prevents hard-coded FPT logic inside `IdentityServiceImpl`.

2. Phase 1 should call OCR front/back + Facematch only, with no manual personal-info entry.
   - Rationale: FPT OCR can extract Vietnamese ID fields; removing manual entry makes flow shorter and demonstrates extraction.
   - Trade-off: OCR errors cannot be corrected by customer in MVP; manual review/retry mitigates.

3. Phase 2 should add liveness video separately.
   - Rationale: FPT liveness needs 5-6s video and frontend UX change.
   - Trade-off: higher cost and harder browser capture validation.

4. Phase 3 auto approve only low-risk.
   - Rationale: rental risk is business-critical; avoid false approvals until telemetry exists.

## Implementation Constraints

- Do not expose FPT API keys to frontend.
- Do not log raw CCCD, base64, or selfies.
- Store KYC media private if possible; current `/uploads` is public and must be corrected before production.
- Existing DB uses `verification_results`, `face_verification_results`, `risk_assessments`; extend carefully.
- FPT sandbox credentials required before real integration tests.

## Sources

1. FPT ID Recognition: https://docs.fpt.ai/docs/en/vision/api/id-recognition
2. FPT Facematch: https://docs.fpt.ai/docs/en/vision/api/face-match
3. FPT Liveness: https://docs.fpt.ai/docs/en/vision/api/liveness
4. FPT Liveness Pricing: https://docs.fpt.ai/docs/en/vision/documentation/liveness-pricing
5. VNPT eKYC Pricing: https://ekyc.vnpt.vn/vi/price-12
6. AWS Rekognition Pricing: https://aws.amazon.com/rekognition/pricing/

## Unresolved Questions

- [ ] FPT sandbox API key available now?
- [ ] Sandbox quota and billing owner?
- [ ] Need NFC/CCCD chip later or not?
