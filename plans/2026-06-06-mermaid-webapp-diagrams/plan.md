# Implementation Plan: Mermaid Webapp Diagrams

**Date:** 2026-06-06
**Created By:** loc.nt <0905071704b@gmail.com>
**Status:** Draft
**Complexity:** Medium
**Estimated Effort:** 1-2 hours revision

## Overview

Revise exportable Mermaid diagrams for the main LensHub/Digital Rental webapp flows. Existing diagrams already cover core ecommerce/admin flows; revision adds rental lifecycle and eKYC coverage verified from current code/docs. Output remains `.mmd` files under `docs/diagrams/mermaid/`.

## Goals

- [ ] One use-case overview covering Guest, Customer, Staff, Admin, Super Admin.
- [ ] Detailed sequence diagrams for all main current business flows.
- [x] README with export instructions to PNG.
- [ ] Mermaid syntax kept simple and renderable.

## Proposed Output

| File | Purpose |
| --- | --- |
| `00-usecase-overview.mmd` | Full use-case style overview. |
| `01-guest-public.sequence.mmd` | Guest browsing, product view, review view, register entry, support ticket. |
| `02-auth.sequence.mmd` | Register, activate, login, refresh, forgot/reset/change password, logout. |
| `03-customer-cart-checkout.sequence.mmd` | Profile, address, cart, voucher, checkout. |
| `04-payment-vnpay.sequence.mmd` | VNPay URL, redirect, callback, verification, result. |
| `05-order-lifecycle.sequence.mmd` | Customer/admin order view/update/confirm received. |
| `06-admin-dashboard.sequence.mmd` | Revenue, orders, top products, low stock, audit activity. |
| `07-admin-catalog.sequence.mmd` | Product and category management. |
| `08-admin-users-permissions.sequence.mmd` | User, role, permission flows. |
| `09-voucher-inventory.sequence.mmd` | Voucher and inventory flows. |
| `10-review-support-audit.sequence.mmd` | Review, support, audit/log flows. |
| `11-rental-lifecycle.sequence.mmd` | Rental availability, checkout, contract, deposit, handover, return, completion. |
| `12-ekyc-verification.sequence.mmd` | Customer eKYC uploads/status and admin approval/rejection. |

## Phases

| Phase | Status | Link |
| --- | --- | --- |
| 01 Diagram structure | Completed | [phase-01-diagram-structure.md](phase-01-diagram-structure.md) |
| 02 Mermaid generation | Completed | [phase-02-mermaid-generation.md](phase-02-mermaid-generation.md) |
| 03 Validation and export guide | Completed | [phase-03-validation-export-guide.md](phase-03-validation-export-guide.md) |
| 04 Rental/eKYC revision | Draft | [phase-04-rental-ekyc-revision.md](phase-04-rental-ekyc-revision.md) |

## References

- [Mermaid syntax research](research/researcher-mermaid-diagram-syntax.md)
- [Mermaid 2026 refresh](research/researcher-2026-06-06-mermaid-diagram-refresh.md)
- [Flow analysis](reports/analysis-webapp-flows.md)
- [Revision analysis](reports/analysis-2026-06-06-diagram-revision.md)

## Next Steps

1. Review this plan.
2. If approved, run `/code plans/2026-06-06-mermaid-webapp-diagrams/plan.md`.
3. Implement phase 04 only: update use-case overview, add rental/eKYC sequence files, update README, validate syntax.

## Unresolved Questions

- Should eKYC be shown as one combined sequence or split customer/admin review into two files?
- Should rental payment stay in `04-payment-vnpay.sequence.mmd` or be cross-linked from new rental lifecycle file?
