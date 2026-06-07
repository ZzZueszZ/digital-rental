# Phase 02: Backend Correctness

## Context Links

- `service/lenshub/src/main/java/org/web/common/utils/FileUploadUtil.java`
- `service/lenshub/src/main/java/org/web/configs/SecurityConfig.java`
- `service/lenshub/src/main/java/org/web/configs/WebConfig.java`
- `service/lenshub/src/main/java/org/web/payments/vnpay/VnPayPaymentController.java`

## Overview

**Date:** 2026-06-06
**Priority:** High
**Status:** Pending

Fix backend behavior that can break production flows: upload paths, CORS, and VNPay redirect handling.

## Key Insights

- Saved upload URLs use `/api/uploads`, static handler serves `/uploads`, delete maps to `api/uploads`.
- CORS exists in both Spring Security and MVC config.
- VNPay redirects to hardcoded localhost and exposes exception messages.

## Requirements

- Single upload URL/path convention.
- Single CORS configuration.
- Configurable frontend payment return URL.
- Safe public error messages.

## Architecture

Bind app config with `@ConfigurationProperties` for upload directory, public API base URL, allowed origins, and frontend return URL.

## Related Code Files

- `FileUploadUtil.java`
- `WebConfig.java`
- `SecurityConfig.java`
- `VnPayPaymentController.java`
- `VnPayService.java`

## Implementation Steps

1. Normalize upload URL prefix and filesystem deletion.
2. Add path traversal guard with `normalize()` and upload-root containment check.
3. Remove duplicate CORS config.
4. Configure VNPay frontend redirect URL through properties.
5. Replace exception text in redirect with safe status/message.

## Todo List

- [ ] Add upload utility tests.
- [ ] Add CORS env property.
- [ ] Add payment redirect config.
- [ ] Run `gradlew test`.

## Success Criteria

- Replacing an image deletes the old file.
- Production frontend URL is not hardcoded.
- Backend tests pass.

## Risk Assessment

- Medium: existing stored image URLs may have old prefix. Mitigate with backward-compatible delete/read handling.

## Security Considerations

Do not allow arbitrary file deletion. Do not leak backend exceptions in public redirects.

## Next Steps

Implement after Phase 01 config keys exist.
