# Project Overview and PDR

## Documentation Maintenance
**Last Updated:** 2026-06-06  
**Document Version:** 1.0  
**Maintained By:** Development Team

## Product Summary

Digital Rental / LensHub is a camera equipment ecommerce and rental platform. The repository currently supports public product browsing, account authentication, cart and checkout workflows, sales orders, rental orders, VNPay payment integration, product/catalog administration, user administration, vouchers, inventory controls, identity/eKYC workflows, reviews, support tickets, and dashboard reporting.

## Product Goals

- Let customers browse products and categories, manage a cart, checkout, pay, rent equipment, track orders, and review products.
- Let administrators manage products, categories, users, roles, permissions, vouchers, inventory, orders, rental devices, audit logs, identity verification, and support tickets.
- Keep backend authorization explicit through permission authorities and method-level security.
- Provide a maintainable Next.js customer/admin frontend aligned with the backend API.

## Users and Roles

| User | Needs |
| --- | --- |
| Guest | Browse products, categories, product reviews, register, login, contact support. |
| Customer | Manage profile, addresses, cart, checkout, payments, orders, reviews. |
| Staff/Admin | Manage catalog, orders, inventory, vouchers, support tickets, dashboard data. |
| Super Admin | Manage users, roles, permissions, audit visibility. |

## Functional Scope

Backend modules verified in `service/lenshub/src/main/java/org/web`:

- `authentication`: login, register, refresh, activation, password reset, logout, roles, permissions.
- `users`: user CRUD, profile update, avatar upload, account lock/unlock/reset.
- `products` and `categories`: catalog CRUD, soft delete/restore, gallery, price history.
- `carts` and `orders`: cart item management, checkout, order lookup, admin order operations.
- `payments`: VNPay payment URL creation, return handling, payment transaction logs.
- `inventory`: stock adjustment and inventory audit logs.
- `vouchers`: voucher CRUD, activation, active vouchers, voucher application.
- `reviews`: product reviews, review images, report/hide/admin moderation flows.
- `rentals`: rental checkout, rental lifecycle, contracts, handover/return reports, deposits, devices, availability.
- `identity`: eKYC sessions, artifacts, risk assessment, customer status, admin review.
- `addresses`: shipping address CRUD for current user and admin user-specific management.
- `dashboard`: revenue, order, top product, low-stock, daily chart, and user summaries.
- `support`: public support ticket creation and admin support operations.
- `common`: response envelope, audit logging, exception handling, shared enums.

## Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Security | Use stateless JWT, BCrypt password hashing, method-level permission checks, and explicit public route allowlists. |
| API consistency | Use `ApiResponse<T>` with `statusCode`, `message`, `success`, `data`, optional `pagination`, and optional `meta`. |
| Reliability | Keep PostgreSQL and Redis setup documented. Current repository does not include verified PostgreSQL compose for the active backend. |
| Maintainability | Keep domain modules grouped by controller, service, repository, model, DTO, and mapper layers. |
| UX | Main frontend should use the existing shadcn/Tailwind visual system and keep admin workflows dense, clear, and task-oriented. |

## Acceptance Criteria

- Public users can access auth, product/category reads, product review reads, VNPay callbacks, uploads, Swagger, and support ticket creation without a token.
- Protected endpoints require JWT authentication and, where present, the exact `@PreAuthorize` authority.
- Frontends call the backend through configurable API base URLs.
- Documentation in `docs/` is updated when modules, public APIs, configuration, or UX conventions change.

## Constraints

- Backend uses Java 17 and Spring Boot 4 in `service/lenshub`.
- Main backend context path is `/api`; local port is `8080`.
- Development defaults expect PostgreSQL on host port `5433` and Redis on `6379`.
- Some repository areas are legacy or transitional: `migration`, `docker/docker-compose.yml`, and `deploy/redis/docker-compose.yml`.

## Open Questions

- Whether legacy MySQL/Oracle migration assets are still required.
- Production deployment target and environment variable policy are not finalized.
- Verified PostgreSQL container setup is missing.
