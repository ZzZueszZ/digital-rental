# Analysis Report: Diagram Revision Scope

**Date:** 2026-06-06

## Current Diagram Set

Existing files cover:

- Use-case overview.
- Guest/public browsing.
- Auth/account recovery.
- Customer profile/cart/checkout.
- VNPay sale payment.
- Order lifecycle.
- Admin dashboard.
- Catalog management.
- Users/roles/permissions.
- Voucher/inventory.
- Review/support/audit.

## Missing or Undercovered Current Flows

- Rental availability: `/rentals/products/{id}/availability`.
- Rental checkout: `/rentals/checkout`.
- Rental contract signing: `/rentals/{id}/contract/sign`.
- Staff rental lifecycle: prepare, handover report, collect deposit, handover, return report, complete.
- Rental device admin: create/update devices, list product devices, list available devices.
- eKYC customer flow: initiate, upload front/back/selfie, submit, status.
- eKYC admin flow: pending list, approve, reject.

## Proposed New/Updated Files

- Update `00-usecase-overview.mmd`.
- Add `11-rental-lifecycle.sequence.mmd`.
- Add `12-ekyc-verification.sequence.mmd`.
- Update `docs/diagrams/mermaid/README.md`.

## Dependencies

- Existing docs: `docs/codebase-summary.md`, `docs/project-overview-pdr.md`, `docs/system-architecture.md`.
- Existing diagram style from `docs/diagrams/mermaid/*.mmd`.
- Backend route names from rental, identity, eKYC, and VNPay controllers.

## Risk Notes

- Rental flow spans order-like state and payment-like state; keep diagram focused on lifecycle and refer payment detail to VNPay diagram.
- eKYC has two controller styles (`/identity/...` and `/ekyc/...`); diagram should show canonical user-facing flow and admin review without overfitting duplicates.

## Unresolved Questions

- Which eKYC route family is canonical for frontend use: `/identity/ekyc/*` or `/ekyc/*`?
- Should staff/admin/super-admin be separated in rental/eKYC diagrams or grouped by permission overlap?
