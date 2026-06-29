# Phase 02: Resend HTTPS Transport

## Context links

- [Parent plan](plan.md)
- [Phase 01](phase-01-mail-provider-boundary.md)
- [Resend research](research/resend-api-java-research.md)

## Overview

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** DONE
**Review Status:** PASSED

**Progress:** Step 6 complete - Tests 45/45 passed; review found 0 critical issues.

Implement Resend `POST /emails` using the existing Spring HTTP stack.

## Key Insights

- Direct `RestClient` avoids SDK Jackson/OkHttp dependency risk.
- Idempotency makes bounded retries safe for 24 hours.
- CID images map to Base64 attachment content plus `content_id`.

## Requirements

- HTTPS base URL default `https://api.resend.com`.
- Bearer API key, JSON payload, and optional `Idempotency-Key`.
- Configurable connect/read timeout with safe production defaults.
- Retry only `429` and `5xx`, at most once, respecting bounded
  `Retry-After`.
- Classify `400/401/403/409/422` as permanent failures.
- Parse and return Resend message ID without logging request content.

## Architecture

```text
MailMessage -> Resend payload -> POST /emails
                                -> provider message ID
                                `-> typed permanent/transient failure
```

## Related code files

- Create `common/mails/gateway/ResendMailGateway.java`.
- Create `common/mails/config/MailProperties.java`.
- Create `common/mails/config/MailGatewayConfiguration.java`.
- Modify `application.yml`.
- Modify `application-prod.yml`.
- Modify `.env.example`.

## Implementation Steps

1. Bind provider, API URL/key, from address, timeout, and attempt limits.
2. Configure `RestClient` with bounded request factory timeouts.
3. Map HTML/text/recipient/category and attachments to Resend JSON.
4. Send idempotency header and parse success response ID.
5. Map status/error type into sanitized typed exceptions.
6. Add one bounded transient retry without retrying invalid requests.
7. Force `app.mail.provider=resend` and `${RESEND_API_KEY}` in PROD.

## Todo list

- [x] Add Resend properties and conditional bean.
- [x] Implement payload mapping.
- [x] Implement CID attachment mapping.
- [x] Implement timeout/error/retry behavior.
- [x] Remove PROD SMTP credential requirement.

## Success Criteria

- No SMTP connection is attempted with PROD profile.
- Resend calls use HTTPS, auth header, and stable idempotency key.
- CID payload respects size/content ID rules.
- Permanent errors fail immediately; transient errors are bounded.

## Risk Assessment

| Risk | Impact | Mitigation |
| --- | --- | --- |
| API key/domain invalid | High | Fail-fast config plus smoke send |
| Attachment exceeds 40 MB | Medium | Preflight total-size cap |
| Retry duplicates email | High | Required idempotency key |
| Request thread blocked | Medium | Short timeout and max two attempts |

## Security Considerations

- Store `RESEND_API_KEY` only in VPS environment and CI secrets.
- Use a sending-only scoped key.
- Do not expose provider errors verbatim to API clients.

## Next steps

Define critical delivery behavior and add tests.

## Unresolved Questions

- Final timeout values: recommended connect 3s, read 10s.
