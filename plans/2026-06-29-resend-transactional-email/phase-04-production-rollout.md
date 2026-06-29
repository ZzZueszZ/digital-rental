# Phase 04: Resend Production Rollout

## Context links

- [Parent plan](plan.md)
- [Phase 03](phase-03-delivery-semantics-and-tests.md)
- `docs/deployment-guide.md`
- `docker/docker-compose.prod.yml`

## Overview

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** Pending
**Review Status:** Pending

Verify domain, deploy the API key, smoke-test all critical flows, and define
rollback.

## Key Insights

- A Resend test account cannot send broadly until its domain is verified.
- Sender reputation depends on correct SPF/DKIM/DMARC.
- Rollback must not silently select blocked Gmail SMTP on DigitalOcean.

## Requirements

- Verify recommended `mail.lenshub.shop`.
- Add provider-issued SPF/DKIM and project-approved DMARC.
- Create a sending-only production API key.
- Store key only in `/opt/lenshub/compose/backend.prod.env`.
- Smoke activation, resend, password OTP, contract OTP, order notification,
  CID rendering, and failure behavior.
- Document key rotation and provider outage response.

## Architecture

```text
LensHub backend --HTTPS 443--> Resend
mail.lenshub.shop --SPF/DKIM/DMARC--> recipient mail server
```

## Related code files

- Modify `docs/deployment-guide.md`.
- Modify `docs/system-architecture.md`.
- Modify `docs/codebase-summary.md`.
- Modify production plan/roadmap status.
- Update VPS `backend.prod.env` outside Git.

## Implementation Steps

1. Add and verify sending domain in Resend.
2. Configure DNS records and wait for verified status.
3. Create scoped key and set PROD environment:
   `APP_MAIL_PROVIDER=resend`, `RESEND_API_KEY`, and verified
   `APP_MAIL_FROM`.
4. Remove obsolete PROD Gmail username/password.
5. Deploy immutable backend image and monitor sanitized logs.
6. Run critical and notification smoke matrix.
7. Test invalid key in staging and verify critical `503`.
8. Rotate key once to prove the runbook.

## Todo list

- [ ] Verify sending domain and DNS.
- [ ] Install scoped API key.
- [ ] Deploy production image.
- [ ] Execute smoke matrix.
- [ ] Verify CID images and inbox placement.
- [ ] Document rotation/outage procedure.

## Success Criteria

- Real Gmail and non-Gmail recipients receive all critical messages.
- PROD makes no connection to SMTP ports.
- SPF/DKIM pass and DMARC aligns.
- Failure is visible without leaking secrets.
- Key rotation completes without code change.

## Risk Assessment

| Risk | Impact | Mitigation |
| --- | --- | --- |
| DNS verification delay | Medium | Configure before deploy |
| Spam placement | High | Dedicated subdomain and auth records |
| Provider outage | High | Clear 503/resend path; future outbox |
| Key exposure | Critical | Scoped key, rotation, no logs/Git |

## Security Considerations

- Never paste the production API key into chat, Git, or workflow output.
- Disable old Gmail app password and rotate any previously exposed secret.
- Keep click/open tracking disabled unless privacy requirements approve it.

## Next steps

After stable MVP delivery, evaluate durable outbox and signed delivery/bounce
webhooks as a separate plan.

## Unresolved Questions

- Required DMARC policy at first rollout: recommended start `p=none`, then
  tighten after observing reports.
