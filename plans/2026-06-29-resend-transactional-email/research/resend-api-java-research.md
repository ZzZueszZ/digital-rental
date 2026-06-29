# Research: Resend Transactional Email for LensHub

**Date:** 2026-06-29
**Scope:** Java integration, delivery semantics, DNS, attachments, security

## Findings

- DigitalOcean blocks outbound SMTP ports `25`, `465`, and `587`; an HTTPS API
  avoids the platform restriction.
- Resend sends through `POST /emails` over HTTPS. A verified owned domain is
  required before sending to arbitrary recipients.
- Domain setup exposes provider-generated SPF and DKIM records. DMARC should
  also be configured before production cutover.
- Resend has a Java SDK. Maven Central currently lists
  `com.resend:resend-java:4.13.0`; never use the unbounded `+` quickstart
  version.
- The SDK brings OkHttp and Jackson 2.15 runtime dependencies. LensHub already
  has Spring Web/Spring Boot 4, so direct `RestClient` integration is simpler
  and avoids dependency-version risk.
- `POST /emails` supports HTML, text, attachments, and CID inline images.
  Current LensHub order/stock templates can retain private MinIO images by
  downloading them and sending Base64 attachment content with `content_id`.
- An idempotency key prevents duplicate sends for 24 hours. The same key and
  payload can be retried safely; reusing a key with a different payload returns
  `409`.
- Default API rate limit is five requests per second per team. `429` responses
  expose `Retry-After`; invalid key/domain/payload errors are non-retryable.
- Delivery webhooks are at-least-once and unordered. Signature verification
  requires the raw request body and Svix headers.

## Recommended MVP Design

- Keep template construction in `MailService`.
- Add a provider-neutral `MailGateway` with Resend and SMTP implementations.
- Configure `smtp` locally and force `resend` in `application-prod.yml`.
- Use bounded synchronous calls: connect/read timeout, at most one retry for
  `429`/`5xx`, and a stable idempotency key per logical dispatch.
- Critical messages: activation, password-reset OTP, contract-signing OTP.
  Surface provider failure instead of claiming the message was sent.
- Best-effort messages: order/payment/support/stock notifications. Record
  provider ID or sanitized failure without rolling back business state.
- Defer durable outbox and delivery webhooks until basic production delivery
  is stable. They require schema, replay, deduplication, and operations work.

## Sources

- [DigitalOcean SMTP restriction](https://docs.digitalocean.com/support/why-is-smtp-blocked/)
- [Resend Java quickstart](https://resend.com/docs/send-with-java)
- [Resend Java artifact](https://central.sonatype.com/artifact/com.resend/resend-java)
- [Send Email API](https://resend.com/docs/api-reference/emails/send-email)
- [Domain management](https://resend.com/docs/dashboard/domains/introduction)
- [Attachments and CID images](https://resend.com/docs/dashboard/emails/attachments)
- [Idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [Usage limits](https://resend.com/docs/api-reference/rate-limit)
- [API errors](https://resend.com/docs/api-reference/errors)
- [Webhook verification](https://resend.com/docs/webhooks/verify-webhooks-requests)

## Unresolved Questions

- Use `mail.lenshub.shop` or the root `lenshub.shop` as sending domain?
- Remove the insecure admin flow that emails a generated plaintext password?
- Is SMTP fallback needed after local development receives a Resend test key?
