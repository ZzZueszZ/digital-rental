# Analysis Report: LensHub Webapp Flows

**Date:** 2026-06-06

## Actors

- Guest
- Customer
- Staff
- Admin
- Super Admin
- Frontend Webapp
- Backend API
- Database
- Redis
- Mail Service
- VNPay

## Flow Groups

1. Guest/public browsing and support
2. Authentication and account recovery
3. Customer profile, address, cart, checkout
4. VNPay payment
5. Order lifecycle
6. Product/catalog browsing
7. Admin dashboard
8. Product/category management
9. User and permission management
10. Voucher and inventory
11. Review, support, audit

## File Strategy

Create these Mermaid files:

- `00-usecase-overview.mmd`
- `01-guest-public.sequence.mmd`
- `02-auth.sequence.mmd`
- `03-customer-cart-checkout.sequence.mmd`
- `04-payment-vnpay.sequence.mmd`
- `05-order-lifecycle.sequence.mmd`
- `06-admin-dashboard.sequence.mmd`
- `07-admin-catalog.sequence.mmd`
- `08-admin-users-permissions.sequence.mmd`
- `09-voucher-inventory.sequence.mmd`
- `10-review-support-audit.sequence.mmd`

## Export Strategy

Use any of:

- Mermaid Live Editor import/export
- VS Code Mermaid preview/export extension
- Mermaid CLI: `mmdc -i input.mmd -o output.png`

## Unresolved Questions

- Should rental-specific availability/return/damage flows be included now or later?
- Should staff and admin be separated in every diagram, or grouped as `Admin/Staff` where permissions overlap?
