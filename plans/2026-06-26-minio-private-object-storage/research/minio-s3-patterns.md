# Research: MinIO Private Upload Pattern

**Date:** 2026-06-26

## Findings

- MinIO implements the S3 API. The Java client supports presigned PUT and GET URLs, plus `statObject`, object removal, and stream download.
- Presigned URLs delegate only one object operation for a short time. They do not make the bucket public and must be treated as credentials until expiry.
- Browser CORS must allow the frontend origin and `PUT`, `GET`, `HEAD`; CORS policy is an operational MinIO configuration, not Spring MVC CORS.
- A MinIO client signs the URL with its configured endpoint. Container-internal `http://minio:9000` is invalid in a host browser, so presigning needs a browser-visible endpoint/client.
- Object metadata is necessary but not sufficient for security. The backend must bind every object to the authenticated requester and purpose before providing a signed URL.

## MVP Recommendation

Use one private `rental-assets` bucket. Backend authorizes and records intent, frontend uploads directly, then backend confirms object metadata before state becomes `READY`. Generate read URLs only after authorization.

## Sources

- [MinIO Java Client API](https://min.io/docs/minio/linux/developers/java/API.html)
- [MinIO Java presigned PUT example](https://min.io/docs/minio/linux/developers/java/API.html#presignedputobjectargs)
- [MinIO Java stat object API](https://min.io/docs/minio/linux/developers/java/API.html#statobjectargs)
- [MinIO bucket access policies](https://min.io/docs/minio/linux/administration/identity-access-management/policy-based-access-control.html)

## Research Limits

The workspace web search provider returned HTTP 403 and the in-app browser blocks the local MinIO Console URL. Sources above are official references to verify against the deployed MinIO release during Phase 01.

## Unresolved Questions

- Exact MinIO image/version and its supported CORS administration command are not recorded in the repository.
