# Phase 03: Delivery Semantics and Tests

## Context links

- [Parent plan](plan.md)
- [Phase 02](phase-02-resend-transport.md)
- `authentication/service/impl/AuthServiceImpl.java`
- `rentals/service/impl/RentalServiceImpl.java`
- `users/service/impl/UserServiceImpl.java`

## Overview

**Date:** 2026-06-29
**Created By:** loc.nt <0905071704b@gmail.com>
**Priority:** Critical
**Implementation Status:** Pending
**Review Status:** Pending

Stop false-success responses for critical email while keeping business
notifications resilient.

## Key Insights

- Current catch-all hides all provider failures.
- Auth and contract flows are unusable without delivery.
- Payment/order state must not roll back only because a notification failed.

## Requirements

- Critical: activation, activation resend, change-email activation,
  password-reset OTP, contract-signing OTP.
- Best effort: order/payment/rental/support/stock notification.
- Use deterministic event keys where duplicate callbacks are possible.
- Return sanitized `503 Service Unavailable` for critical delivery failure.
- Preserve audit logs without recording OTP/token/body.
- Add unit and HTTP adapter tests without real Resend calls.

## Architecture

```text
critical send failure    -> MailDeliveryException -> API 503
best-effort send failure -> sanitized WARN/metric -> domain flow continues
```

## Related code files

- Modify `MailService.java` and critical callers.
- Modify `GlobalExceptionHandler.java`.
- Modify order/payment/support callers for best-effort policy.
- Create gateway and service tests under `src/test/java`.
- Modify `ProductionProfileConfigTest.java`.

## Implementation Steps

1. Mark each mail method critical or best effort.
2. Generate stable, non-secret idempotency keys per logical event.
3. Propagate critical failures and map them to `ApiResponse` HTTP 503.
4. Keep notification failures non-fatal with sanitized structured logging.
5. Test success, timeout, `4xx`, `429`, `5xx`, retry, CID, and cleanup.
6. Test register/reset/contract failure semantics.
7. Update PROD property assertions.

## Todo list

- [ ] Implement delivery policies.
- [ ] Add global exception mapping.
- [ ] Add gateway HTTP tests.
- [ ] Add MailService/caller tests.
- [ ] Add production config tests.
- [ ] Run full backend test suite.

## Success Criteria

- Critical API never claims a message was sent after provider failure.
- Domain callbacks remain successful when notification email fails.
- Retry cannot duplicate a logical email.
- Tests make no external network request.
- `./gradlew clean test` passes.

## Risk Assessment

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Transaction/email dual-write | High | Document; outbox follow-up |
| User enumeration via errors | Medium | Preserve generic forgot response |
| Duplicate callback email | Medium | Deterministic idempotency key |

## Security Considerations

- Do not expose whether an email address exists in forgot/resend flows.
- Do not log tokens, OTP values, email bodies, API keys, or full recipients.
- Replace plaintext-password email if approved.

## Next steps

Roll out verified domain and production secret.

## Unresolved Questions

- Should registration roll back user creation when Resend accepted but the DB
  transaction later fails? Durable outbox is the complete solution.
