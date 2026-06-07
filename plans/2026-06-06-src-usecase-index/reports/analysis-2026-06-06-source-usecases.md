# Analysis Report: Source Use Case Index

**Date:** 2026-06-06  
**Scope:** `frontend/src`, `service/lenshub/src`

## Source Index

| Area | Count / Evidence |
| --- | --- |
| Total active src files | 559 |
| Java | 292 |
| TSX | 210 |
| TS | 55 |
| Config/style | 1 YML, 1 CSS |
| Frontend routes | `frontend/src/app` route groups: `(main)`, `(auth)`, `(admin)`, `(staff)`, `(super-admin)`, `app/api` |
| Frontend API clients | `frontend/src/services/*.ts`, `frontend/src/lib/http.ts` |
| Backend API | `service/lenshub/src/main/java/org/web/*/controller/*.java` |

## Actors

- Guest
- Customer
- Staff
- Admin
- Super Admin
- VNPay
- Mail Service
- Redis / token blacklist

## Main Use Cases

### Guest

| Use Case | Source Evidence |
| --- | --- |
| Browse home/catalog | `frontend/src/app/(main)/page.tsx`, `/products`, `/categories` controllers/services |
| View product detail | `frontend/src/app/(main)/products/[id]/page.tsx`, `ProductController GET /products/{id}` |
| View product reviews | `ReviewController GET /reviews/product/{productId}` |
| Check rental availability | `RentalController GET /rentals/products/{id}/availability`, public in `SecurityConfig` |
| Register account | `RegisterForm.tsx`, `AuthController POST /auth/register` |
| Activate account | `AuthController GET /auth/activate`, auth activation pages |
| Send support ticket | `SupportTicketController POST /support/tickets`, public in `SecurityConfig` |
| Read about page | `frontend/src/app/(main)/about/page.tsx` |

### Customer

| Use Case | Source Evidence |
| --- | --- |
| Login/logout/session refresh | `LoginForm.tsx`, `AuthController /login /logout /refresh`, `frontend/src/app/api/auth/refresh-token/route.ts` |
| Recover/reset password | forgot/reset pages, `AuthController /forgot-password /reset-password` |
| Change password/email | `auth.ts`, `AuthController /change-password /change-email` |
| Manage profile and avatar | `profile` pages/services, `UserProfileController /profile` |
| Manage shipping addresses | `profile/address`, `ShippingAddressController /addresses` |
| Manage cart | `profile/cart`, `CartController /carts` |
| Apply voucher | `VoucherController POST /vouchers/apply` |
| Checkout purchase order | `checkout/page.tsx`, `OrderController /orders/checkout`, `/orders/checkout/carts` |
| Pay by VNPay | `payments/vnpay/create`, `checkout/vnpay-return`, `VnPayPaymentController` |
| Track purchase orders | `profile/orders`, `OrderController /orders/my`, `/orders/{id}` |
| Confirm received | `OrderController POST /orders/my/{id}/confirm-received` |
| Create/update/delete/report review | `ReviewController /reviews` customer endpoints |
| Submit eKYC | `profile/ekyc`, `EkycController /ekyc/initiate`, upload front/back/selfie, submit, status |
| Checkout rental | `RentalController POST /rentals/checkout` |
| Track rental order | `RentalController GET /rentals/my`, `/rentals/{id}` |
| Sign rental contract | `RentalController POST /rentals/{id}/contract/sign` |
| Pay rental fee | `VnPayPaymentController /payments/vnpay/rental-fee/*`, rental payment return page |

### Staff / Admin

| Use Case | Source Evidence |
| --- | --- |
| View dashboard metrics | dashboard pages/components, `DashboardController /dashboard/*` |
| Manage products | product pages/components, `ProductController` create/update/delete/restore/gallery/price-history |
| Manage categories | category pages/components, `CategoryController` create/update/delete/restore |
| Manage inventory stock | product stock dialogs, `InventoryController /inventory/products/*/stock*` |
| View inventory audit logs | `InventoryController GET /inventory/audit-logs` |
| Manage sales orders | order pages, `OrderController /orders/admin`, status update |
| Manage rental orders | rental pages, `RentalController /rentals/staff/*` lifecycle endpoints |
| Prepare rental handover | `/rentals/staff/{id}/prepare`, `/handover-report`, `/handover` |
| Collect deposit and complete return | `/collect-deposit`, `/return-report`, `/complete` |
| Manage rental devices | `/rentals/admin/devices`, `/admin/products/{productId}/devices` |
| Manage vouchers | voucher pages, `VoucherController` CRUD/activate/list |
| Moderate reviews | review pages, `ReviewController /reported`, `/hidden`, hide/unhide |
| Handle support tickets | support pages, `SupportTicketController /admin/support/tickets/*` |
| Review eKYC | admin/staff eKYC pages, `EkycAdminController /admin/ekyc/pending`, approve, reject |
| Manage customer addresses | address admin pages, `ShippingAddressController /addresses/user/{userId}` |
| View audit logs | audit pages, `AuditLogController /audit-logs` |
| Manage users | user pages, `UserController /users` CRUD/status/lock/unlock/reset/restore |

### Super Admin

| Use Case | Source Evidence |
| --- | --- |
| All Staff/Admin operations | super-admin route group mirrors admin modules |
| Manage roles | `RoleController /roles`, `frontend/src/app/(super-admin)/super-admin/roles/page.tsx` |
| Manage permissions | `PermissionController /permissions`, permissions page |
| Assign permissions to roles | `RoleController POST /roles/{id}/permissions` |
| Manage users with elevated scope | super-admin users pages/components |
| Access settings | super-admin settings page |

### External Systems

| Use Case | Source Evidence |
| --- | --- |
| VNPay payment redirect/return | `VnPayPaymentController /payments/vnpay/create`, `/return`, `/rental-fee/create`, `/rental-fee/return` |
| Mail account activation/reset | `MailService`, `AuthController` activation/reset flows |
| Redis token blacklist/cache | `TokenBlacklistService`, Redis config in `application.yml` |

## Use Case Groups For Diagram

Recommended high-level diagram groups:

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

## Notes

- Staff/Admin/Super Admin UI duplicates many modules by route prefix; use-case diagram should avoid triplicating same goal unless permissions differ.
- Customer eKYC frontend uses `/ekyc/*`; backend also has `/identity/ekyc/*`. Treat `/ekyc/*` as frontend-observed canonical unless product owner says otherwise.
- Source evidence proves feature surfaces exist; it does not prove every UX branch is complete.

## Unresolved Questions

- Which eKYC route family is canonical: `/ekyc/*` or `/identity/ekyc/*`?
- Should final diagram separate Staff and Admin, or group as `Staff/Admin`?
- Is `settings` a real functional use case or placeholder/admin shell?
