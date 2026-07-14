# Test Report: AI-eKYC Verification Flow

**Date:** 2026-07-02
**Status:** PASS_WITH_LIMITATION

## Results

- Targeted ESLint: pass, 0 errors/warnings in `profile/ekyc/**`.
- Next.js production build: pass; TypeScript and all 78 static routes compiled.
- Whole-repo ESLint: fail, 46 errors and 547 warnings outside changed eKYC scope.
- Browser first load: route/title confirmed; backend absence produced expected network error.
- Backend recovery: started with temporary local MinIO credentials.
- Browser rerun: blocked by repeated Browser plugin timeout; no fallback used.
- Automated coverage: unavailable; frontend has no scoped test runner for this route.

## Static Error-Path Checks

- Invalid/non-image and over-10 MB input rejected before upload.
- Camera permission errors surfaced as toast.
- Media tracks and object URLs cleaned on replace/reset/unmount.
- Liveness cancel/back stops recorder and camera.
- Unsupported/failed MediaRecorder creation handled.
- `PROCESSING`, `FAILED`, and `CANCELLED` render explicitly.
- Missing AI scores render `Chưa có`; no fallback scores.

## Remaining Risk

- Real camera/Microphone behavior across Chromium/Safari not exercised.
- OCR/upload/submit E2E not exercised with authenticated browser session.
- Desktop/mobile screenshot comparison incomplete.

## Unresolved Questions

- None in code. Browser runtime availability blocks rendered QA.
