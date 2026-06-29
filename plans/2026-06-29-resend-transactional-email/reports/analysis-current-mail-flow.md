# Analysis: Current LensHub Mail Flow

**Date:** 2026-06-29

## Current State

- `MailService` is a 700+ line template builder and SMTP transport.
- It injects `JavaMailSender` directly and catches every delivery exception.
- Production requires Gmail SMTP credentials and port `587`, which cannot work
  from the current DigitalOcean Droplet.
- No mail-specific tests exist.
- `application-prod.yml` requires SMTP username/password but has no Resend
  properties.
- HTML templates use CID images downloaded from private MinIO temporary files.

## Call Sites

| Flow | Delivery class | Current failure impact |
| --- | --- | --- |
| Register/change email/resend activation | Critical | API reports success; account remains pending |
| Forgot-password OTP | Critical | API reports success; OTP never arrives |
| Rental contract OTP | Critical | API reports success; contract cannot be signed |
| Admin password reset | Critical/security risk | New plaintext password is emailed |
| Order placed/payment success | Best effort | Customer misses notification |
| Rental payment success | Best effort | Customer misses notification |
| Support reply | Best effort | User misses staff response |
| Low-stock alert | Best effort | Admin misses operational alert |

## Main Defects

1. Transport failure is swallowed, creating false-success API responses.
2. SMTP connection timeout is unbounded in the observed production log.
3. Provider concerns and template concerns are tightly coupled.
4. `ThreadLocal` attachment state adds avoidable lifecycle complexity.
5. Password reset by admin emails a generated plaintext credential.
6. Recipient addresses and stack traces are logged without a PII policy.

## Target Boundary

```text
Domain service
  -> MailService: template + delivery policy
     -> MailGateway
        -> ResendMailGateway (production HTTPS)
        `-> SmtpMailGateway (explicit local fallback)
```

The gateway accepts recipient, subject, HTML/text, CID attachments,
idempotency key, and message category. It returns provider message ID or throws
a typed delivery exception.

## Scope Decision

- Implement direct Resend HTTPS transport with existing Spring `RestClient`.
- Preserve current templates and CID images.
- Add critical vs best-effort behavior.
- Do not add database outbox or webhooks in MVP.
- Preserve SMTP only for local rollback during migration.

## Unresolved Questions

- Product decision required for admin plaintext-password reset.
- Production sender domain and From display name require confirmation.
