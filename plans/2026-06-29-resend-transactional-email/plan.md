# Implementation Plan: Resend Transactional Email

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** In Progress
**Complexity:** Medium
**Estimated Effort:** 2-3 engineer days

## Outcome

Replace unusable production Gmail SMTP delivery with Resend HTTPS while
preserving current LensHub templates, CID images, and a controlled local SMTP
fallback. Critical auth/contract messages must no longer report false success.

## Locked Architecture

- `MailService`: builds templates and selects critical/best-effort policy.
- `MailGateway`: provider-neutral transport contract.
- `ResendMailGateway`: production implementation via Spring `RestClient`.
- `SmtpMailGateway`: explicit local fallback during migration.
- Production sender: verified dedicated subdomain, recommended
  `mail.lenshub.shop`.
- Bounded timeout plus one idempotent retry for `429`/`5xx`.
- Outbox and delivery webhooks deferred beyond MVP.

## Phases

| Phase | Scope | Depends on | Status |
| --- | --- | --- | --- |
| [01](phase-01-mail-provider-boundary.md) | Provider contract, config, SMTP extraction | approval | DONE (2026-06-29) |
| [02](phase-02-resend-transport.md) | Resend HTTP adapter, attachments, retries | 01 | DONE (2026-06-29) |
| [03](phase-03-delivery-semantics-and-tests.md) | Critical failures, tests, security cleanup | 02 | Pending |
| [04](phase-04-production-rollout.md) | DNS, secrets, deploy, smoke and rollback | 03 | Pending |

## Validation Matrix

| Layer | Required validation |
| --- | --- |
| Unit | Payload mapping, CID attachment, idempotency, error classification |
| Service | Critical failure propagates; notifications remain best effort |
| Config | PROD requires Resend key/from and no Gmail credential |
| Integration | Mock HTTP `202`, `4xx`, `429`, timeout, `5xx` |
| Production | Domain verified, real activation/reset/OTP delivery |

## Success Metrics

- DigitalOcean sends mail only through HTTPS `443`.
- Activation/reset/contract OTP failures are visible to clients/operators.
- Duplicate payment/order callbacks do not duplicate email within 24 hours.
- API key, OTP, token, and email body never appear in logs.
- Existing order/rental CID images render after migration.
- Local SMTP fallback remains selectable outside PROD.

## Approval Gate

Do not implement until this plan and the plaintext-password decision are
approved.

## Unresolved Questions

- Approve `mail.lenshub.shop` as the sending domain?
- Replace admin plaintext-password email with a reset-link flow in this scope?
