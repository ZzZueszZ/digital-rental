# Phase 01: Mail Provider Boundary

## Context links

- [Parent plan](plan.md)
- [Current flow analysis](reports/analysis-current-mail-flow.md)
- `service/lenshub/src/main/java/org/web/common/mails/MailService.java`
- `service/lenshub/src/main/resources/application.yml`

## Overview

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** DONE (2026-06-29)
**Review Status:** PASSED
**Progress:** Step 6 complete - approved by user; email subjects, HTML, and template output preserved.

Separate message composition from delivery without changing user-visible
templates.

## Key Insights

- Current SMTP transport is embedded in a large template service.
- Local fallback reduces rollout risk, but PROD must not select SMTP.
- CID attachment metadata must remain provider-neutral.

## Requirements

- Introduce `MailGateway`, immutable message, attachment, category, and result
  types.
- Introduce typed `MailDeliveryException` without leaking provider secrets.
- Extract existing JavaMail logic into conditional `SmtpMailGateway`.
- Replace field injection with constructor injection in mail components.
- Remove dead plain-text branches and `ThreadLocal` attachment state.

## Architecture

```text
MailService -> MailGateway
                  `-> SmtpMailGateway when app.mail.provider=smtp
```

## Related code files

- Modify `common/mails/MailService.java`.
- Create `common/mails/gateway/MailGateway.java`.
- Create `common/mails/gateway/MailMessage.java`.
- Create `common/mails/gateway/MailAttachment.java`.
- Create `common/mails/gateway/MailDeliveryResult.java`.
- Create `common/mails/gateway/MailDeliveryException.java`.
- Create `common/mails/gateway/SmtpMailGateway.java`.
- Modify `application.yml` and `.env.example`.

## Implementation Steps

1. Define a minimal gateway contract carrying HTML, optional text, attachments,
   category, and idempotency key.
2. Move MIME/JavaMail code into the SMTP adapter.
3. Convert MinIO temporary images into method-local attachment lists.
4. Make provider selection explicit through `app.mail.provider`.
5. Keep existing sender/admin/template output stable.

## Todo list

- [x] Add provider-neutral mail types.
- [x] Extract SMTP adapter.
- [x] Refactor `MailService`.
- [x] Add configuration properties.
- [x] Verify local SMTP compatibility.

## Success Criteria

- `MailService` has no `JavaMailSender` dependency.
- Existing templates and CID references remain unchanged.
- Exactly one `MailGateway` bean exists per configured provider.
- Backend compiles and existing tests pass.

## Risk Assessment

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Template regression | Medium | Snapshot key HTML fragments |
| Temp-file leak | Medium | `finally` cleanup tests |
| Multiple provider beans | High | Conditional configuration test |

## Security Considerations

- Never include body, OTP, activation token, or credentials in exceptions.
- Sanitize recipient identity in transport logs.

## Next steps

Implement Resend transport after the boundary passes tests.

## Unresolved Questions

- Keep SMTP as default locally or require explicit `APP_MAIL_PROVIDER=smtp`?
