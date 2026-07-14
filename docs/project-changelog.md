# Project Changelog

## 2026-07-14

### Bug Fixes

- Fixed KYC submit to reuse the persisted OCR preview, including incomplete results, so submit no longer triggers a second logical OCR call.
- Added `409 CONFLICT` guards when the OCR preview is missing or its front/back artifacts do not match the submitted identity images.
- Added three processor regression tests covering incomplete preview reuse, missing preview rejection, and preview artifact mismatch; targeted and full backend test suites pass.
