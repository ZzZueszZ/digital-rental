# Phase 04: DNS, NGINX, TLS, and Public MinIO

## Context links

- [Parent plan](plan.md)
- [Phase 03](phase-03-vps-infrastructure.md)
- [MinIO proxy research](research/researcher-production-deployment.md)

## Overview

**Date:** 2026-06-28
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** Pending
**Review Status:** Pending
Expose API and MinIO S3 safely through HTTPS; keep bucket and console private.

## Key Insights

- `www.lenshub.shop` is HTTPS; raw HTTP VPS IP cannot serve browser uploads.
- Dedicated storage hostname still resolves to same VPS IP and supports S3 tools.
- Presigned signatures require stable public hostname and preserved `Host`.
- S3 public endpoint is not equivalent to public anonymous bucket.

## Requirements

- DNS A/AAAA: `api.lenshub.shop`, `storage.lenshub.shop` → VPS.
- Certbot-managed certificates and renewal test.
- API proxy to `127.0.0.1:8080`.
- Storage proxy to `127.0.0.1:9000`; buffering disabled, HTTP/1.1, host preserved.
- MinIO Console stays `127.0.0.1:9001`.
- Bucket anonymous access disabled.
- CORS exact origin `https://www.lenshub.shop`.

## Architecture

```text
Internet 443
  api.lenshub.shop     -> NGINX -> backend
  storage.lenshub.shop -> NGINX -> MinIO S3
SSH tunnel only        -> 127.0.0.1:9001 Console
```

## Related code files

- Create `deploy/production/nginx/api.lenshub.shop.conf`.
- Create `deploy/production/nginx/storage.lenshub.shop.conf`.
- Create `deploy/production/scripts/verify-tls.sh`.
- Modify `frontend/next.config.ts` only if Next Image loads MinIO URLs.
- Update Vercel environment outside repository.

## Implementation Steps

1. Create DNS records and wait for resolution.
2. Install NGINX/Certbot; issue certificates.
3. Configure security headers, request IDs, access/error logs.
4. API: sensible body limit, proxy/read timeout compatible with FPT liveness.
5. Storage: preserve Host; disable request/response buffering; allow configured max object size.
6. Set backend `MINIO_PUBLIC_ENDPOINT=https://storage.lenshub.shop`.
7. Configure MinIO CORS for exact production origin and required PUT/GET/HEAD headers.
8. Set backend CORS to exact Vercel/custom domains.
9. Configure Vercel `NEXT_PUBLIC_API_URL=https://api.lenshub.shop/api`.
10. Validate presigned upload/download from browser and `mc`/S3 client.
11. Test certificate auto-renewal.

## Todo list

- [ ] Create DNS records.
- [ ] Issue TLS certificates.
- [ ] Deploy NGINX configs.
- [ ] Lock CORS and bucket policy.
- [ ] Update Vercel variables.
- [ ] Test browser and tool access.

## Success Criteria

- TLS grade acceptable; no mixed content.
- Direct requests to ports 8080/9000/9001 fail externally.
- Browser can PUT/GET private object only with valid presigned URL.
- Anonymous object listing/download denied.
- Scoped S3 tool account can access only intended bucket/prefix.
- Console reachable only through SSH tunnel.

## Risk Assessment

| Failure mode | Probability | Impact | Mitigation/Rollback |
| --- | --- | --- | --- |
| Presigned signature mismatch | Medium | High | Preserve Host; public endpoint equals external hostname |
| CORS blocks upload | Medium | High | Preflight integration test; exact origin/method/header policy |
| NGINX buffers large video | Medium | High | Disable buffering; test representative liveness video |
| Console exposed | Low | High | Loopback bind; firewall/external scan |

## Security Considerations

- Apply rate limits to auth, presign, and eKYC endpoints.
- Do not add anonymous MinIO bucket policy.
- Tool credentials must be scoped and independently revocable.
- Avoid wildcard CORS with credentialed requests.

## Next steps

Phase 06 uses these stable public endpoints for deployment smoke tests.
