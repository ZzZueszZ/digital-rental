# Use Case Index

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
**Maintained By:** Development Team

## Scope

This index is source-backed from:

- `frontend/src`
- `service/lenshub/src`

It groups endpoint/page-level behavior into actor goals. It is not a full API reference.

## Source Coverage

| Area | Count / Evidence |
| --- | --- |
| Active source files | 559 |
| Java files | 292 |
| TSX files | 210 |
| TS files | 55 |
| Config/style | 1 YML, 1 CSS |
| Frontend evidence | `frontend/src/app`, `frontend/src/services`, `frontend/src/lib/http.ts` |
| Backend evidence | `service/lenshub/src/main/java/org/web/*/controller/*.java` |

## Actors

- Guest
- Customer
- Staff/Admin
- Super Admin
- VNPay
- Mail Service
- Redis / token blacklist

## Main Use Cases

### Guest

| Use Case | Source Evidence |
| --- | --- |
| Browse catalog | `frontend/src/app/(main)/page.tsx`, `ProductController`, `CategoryController` |
| View product detail | `frontend/src/app/(main)/products/[id]/page.tsx`, `GET /products/{id}` |
| View product reviews | `GET /reviews/product/{productId}` |
| Check rental availability | `GET /rentals/products/{id}/availability` |
| Register and activate account | auth register/verify pages, `POST /auth/register`, `GET /auth/activate` |
| Send support ticket | `POST /support/tickets` |

### Customer

| Use Case | Source Evidence |
| --- | --- |
| Authenticate and maintain session | `LoginForm.tsx`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Recover/change credentials | forgot/reset/change password/email flows in `AuthController` |
| Manage profile and avatar | profile pages/services, `/profile`, `/profile/avatar` |
| Manage addresses | profile address page, `/addresses` |
| Manage cart | profile cart page, `/carts` |
| Apply voucher | `POST /vouchers/apply` |
| Checkout purchase | checkout page, `/orders/checkout`, `/orders/checkout/carts` |
| Pay purchase by VNPay | `/payments/vnpay/create`, `/payments/vnpay/return` |
| Track and confirm orders | `/orders/my`, `/orders/{id}`, `/orders/my/{id}/confirm-received` |
| Create/report reviews | `/reviews`, `/reviews/{id}/report` |
| Submit eKYC | profile eKYC page, `/ekyc/initiate`, uploads, `/ekyc/submit`, `/ekyc/status` |
| Checkout and track rental | `/rentals/checkout`, `/rentals/my`, `/rentals/{id}` |
| Sign rental contract | `/rentals/{id}/contract/sign` |
| Pay rental fee | `/payments/vnpay/rental-fee/create`, `/rental-fee/return` |

### Staff/Admin

| Use Case | Source Evidence |
| --- | --- |
| View dashboard metrics | `/dashboard/revenue`, order summary, top products, low stock, user summary |
| Manage catalog | `/products`, `/categories`, gallery, price history, restore/hard delete |
| Manage inventory | `/inventory/products/{productId}/stock*`, `/inventory/audit-logs` |
| Manage purchase orders | `/orders/admin`, `/orders/admin/{id}`, `/orders/{id}/status` |
| Manage rentals | `/rentals/staff`, prepare, handover, deposit, return, complete |
| Manage rental devices | `/rentals/admin/devices`, `/rentals/admin/products/{productId}/devices` |
| Manage vouchers | `/vouchers`, `/vouchers/{id}/activate`, `/vouchers/active` |
| Moderate reviews | `/reviews/reported`, `/reviews/hidden`, hide/unhide |
| Handle support tickets | `/admin/support/tickets` |
| Review eKYC | `/admin/ekyc/pending`, approve, reject |
| Manage users and addresses | `/users`, `/users/{id}/profile`, `/addresses/user/{userId}` |
| View audit logs | `/audit-logs` |

### Super Admin

| Use Case | Source Evidence |
| --- | --- |
| Perform Staff/Admin operations | `frontend/src/app/(super-admin)` mirrors admin modules |
| Manage roles | `/roles` |
| Manage permissions | `/permissions` |
| Assign permissions to roles | `POST /roles/{id}/permissions` |
| Manage elevated user administration | super-admin user pages and `UserController` |

### External Systems

| External System | Use Case |
| --- | --- |
| VNPay | Payment URL creation, redirect, return verification for purchase and rental fee |
| Mail Service | Account activation and password reset emails |
| Redis | Token blacklist/cache support |

## Diagram Groups

Use these groups for use-case and sequence diagrams:

1. Public browsing and support.
2. Authentication and account recovery.
3. Customer profile, address, cart, checkout.
4. Purchase payment and order lifecycle.
5. Rental lifecycle and rental payment.
6. eKYC customer submission and admin review.
7. Catalog, category, inventory management.
8. Voucher management and voucher application.
9. Review creation/moderation.
10. Support ticket handling.
11. Dashboard and audit logs.
12. User, role, permission administration.

## Decisions

- Treat `/ekyc/*` as the frontend-observed canonical customer eKYC route family.
- Group Staff/Admin where route goals overlap.
- Keep Super Admin separate for role/permission administration.

## Unresolved Questions

- Is `settings` a real functional use case or a placeholder screen?
- Should final UML-style diagram use strict UML tooling instead of Mermaid flowchart approximation?
