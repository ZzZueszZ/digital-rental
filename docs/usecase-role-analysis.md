# Use Case Role Analysis

## Documentation Maintenance

**Last Updated:** 2026-06-10  
**Document Version:** 1.0  
**Maintained By:** Development Team

## Scope

Phan tich lai use case theo code backend `service/lenshub`.

Nguon doi chieu chinh:

- `service/lenshub/src/main/java/org/web/configs/SecurityConfig.java`
- `service/lenshub/src/main/java/org/web/seeders/RolePermissionSeeder.java`
- `service/lenshub/src/main/java/org/web/seeders/PermissionSeeder.java`
- Controller trong `service/lenshub/src/main/java/org/web/**/controller`

## Role Model Theo Code

Backend co 4 role:

| Role | Ghi chu |
| --- | --- |
| Guest | Chua dang nhap, chi dung endpoint `permitAll`. |
| Customer | Role mac dinh cho nguoi dung mua/thue. Co cart, order, profile, address cua minh. |
| Staff | Xu ly van hanh: dashboard, don hang, don thue, support, review, doc catalog/kho. Han che thao tac ghi catalog/kho/user. |
| Admin | Quan tri nghiep vu day du hon Staff: user, catalog, inventory, voucher. Chi doc role/permission. |
| Super Admin | Co tat ca permission, gom quyen ghi role/permission. |

Code dang dung permission/authority de bao ve API, khong chi dua vao role name.

## Permission Summary

| Role | Permissions noi bat |
| --- | --- |
| Customer | `AUTH_LOGOUT`, `AUTH_REFRESH`, `USER_PROFILE_READ`, `USER_PROFILE_UPDATE`, `ADDRESS_READ`, `ADDRESS_WRITE`, `CART_READ`, `CART_WRITE`, `ORDER_READ`, `ORDER_WRITE` |
| Staff | Customer-level profile/auth + `DASHBOARD_READ`, `USER_READ`, `CATEGORY_READ`, `PRODUCT_READ`, `ADDRESS_READ_ALL`, `INVENTORY_READ`, `VOUCHER_READ`, `VOUCHER_STATUS_MANAGE`, `ORDER_MANAGE`, `REVIEW_MANAGE`, `SUPPORT_READ`, `SUPPORT_WRITE` |
| Admin | Staff-level + `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`, `CATEGORY_WRITE`, `ADDRESS_WRITE_ALL`, `PRODUCT_WRITE`, `INVENTORY_WRITE`, `VOUCHER_WRITE`, `ROLE_READ`, `PERMISSION_READ` |
| Super Admin | Tat ca permissions, gom `ROLE_WRITE`, `PERMISSION_WRITE` |

## Functional Requirement Mapping

| ID | Role | Use Case | Code-backed mo ta |
| --- | --- | --- | --- |
| G-01 | Guest | Xem catalog | Xem category, danh sach product, chi tiet product, review theo product, rental availability. Public qua `GET /categories/**`, `GET /products/**`, `GET /reviews/product/**`, `GET /rentals/products/{id}/availability`. |
| G-02 | Guest | Dang ky/kich hoat | Tao account, activate bang token, resend activation email. Public qua `/auth/register`, `/auth/activate`, `/auth/activate/resend`. |
| G-03 | Guest | Gui ho tro | Gui support ticket cong khai qua `POST /support/tickets`. |
| C-01 | Customer | Xac thuc | Dang nhap, introspect token, refresh token, logout, forgot/reset password, change email, change password. Public mot phan qua `/auth/**`, mot phan can authenticated. |
| C-02 | Customer | Quan ly ho so | Xem/sua profile, upload/delete avatar, CRUD dia chi cua minh, dat dia chi mac dinh. Qua `/profile/**`, `/addresses/**`. |
| C-03 | Customer | Mua hang | Quan ly gio hang, xem voucher active, apply voucher, checkout truc tiep/tu gio hang, tao URL thanh toan VNPay, xem don cua minh, xem chi tiet don, confirm received. Qua `/carts`, `/vouchers/active`, `/vouchers/apply`, `/orders/**`, `/payments/vnpay/create`. |
| C-04 | Customer | Thue thiet bi | Check availability, checkout rental, xem danh sach/chi tiet rental cua minh, gui OTP ky hop dong, ky hop dong, tao URL thanh toan phi thue VNPay. Qua `/rentals/**`, `/payments/vnpay/rental-fee/create`. |
| C-05 | Customer | eKYC | Khoi tao eKYC, upload front/back/selfie/liveness video, OCR preview, submit ho so, xem status. Qua `/ekyc/**`. |
| C-06 | Customer | Review san pham | Tao/sua/xoa review, xem review cua minh theo product, report review. Qua `/reviews` voi `ORDER_WRITE`/`ORDER_READ`. Nen them vao use case neu diagram can day du theo code. |
| A-01 | Staff/Admin | Xem dashboard | Xem revenue, order summary, top products, low stock, daily chart, user summary. Qua `/dashboard/**`. Dang co trong code nhung chua co trong bang yeu cau ban dau. |
| A-02 | Staff/Admin | Quan ly catalog | Theo code nen tach Staff va Admin: Staff co `PRODUCT_READ`, `CATEGORY_READ`, xem trashed/deleted va price history; Admin co `PRODUCT_WRITE`, `CATEGORY_WRITE` de tao/sua/xoa/khoi phuc product/category, gallery, price. |
| A-03 | Staff/Admin | Quan ly ton kho | Staff xem audit log ton kho (`INVENTORY_READ`); Admin dieu chinh stock ban/thue/tong (`INVENTORY_WRITE`). |
| A-04 | Staff/Admin | Quan ly don | Staff/Admin xem/cap nhat don mua, quan ly rental lifecycle: prepare, handover report, collect deposit, handover, return report, complete. Qua `/orders/admin/**`, `/orders/{id}/status`, `/rentals/staff/**`. |
| A-05 | Staff/Admin | Quan ly thiet bi cho thue | Tao/sua/xoa physical rental device, xem device theo product, xem device available, cap nhat status. Qua `/rentals/admin/devices/**`. Nen them neu diagram can sat code. |
| A-06 | Staff/Admin | Quan tri ho tro | Xem ticket, xem chi tiet, cap nhat status, reply ticket. Qua `/admin/support/tickets/**`. |
| A-07 | Staff/Admin | Quan tri review | Xem tat ca/reported/hidden review, hide/unhide review. Qua `/reviews`, `/reviews/reported`, `/reviews/hidden`, `/reviews/{id}/hide`, `/reviews/{id}/unhide`. |
| A-08 | Staff/Admin | Duyet eKYC | Xem pending eKYC, approve, reject. Qua `/admin/ekyc/**`. |
| A-09 | Staff/Admin | Quan ly voucher | Staff xem voucher, activate/deactivate voucher. Admin tao/sua voucher. Qua `/vouchers/**`. |
| A-10 | Staff/Admin | Xem audit/payment log | Xem audit log he thong qua `/audit-logs`, xem payment transaction logs qua `/payments/logs`. |
| A-11 | Admin | Quan ly user | CRUD user, lock/unlock, restore, reset password, cap nhat profile/avatar user, quan ly address cua user khac. Staff chi co `USER_READ` va `ADDRESS_READ_ALL`, khong co create/update/delete. |
| SA-01 | Super Admin | Quan ly RBAC | CRUD role, CRUD permission, gan permission cho role. Qua `/roles/**`, `/permissions/**`. Chi Super Admin co `ROLE_WRITE`, `PERMISSION_WRITE` theo seeder. |

## De Xuat Dieu Chinh Bang Yeu Cau

Bang hien tai hop ly o muc tong quan, nhung neu muon sat code hon thi nen sua:

| Hien tai | Nen dieu chinh |
| --- | --- |
| `A-01 Staff/Admin Quan ly catalog` | Tach thanh `Staff xem catalog noi bo` va `Admin quan ly catalog`, vi Staff khong co `PRODUCT_WRITE`/`CATEGORY_WRITE`. |
| `A-02 Staff/Admin Quan ly ton kho` | Tach thanh `Staff xem audit ton kho` va `Admin dieu chinh ton kho`, vi Staff khong co `INVENTORY_WRITE`. |
| `A-04 Quan tri ho tro: support ticket, review, eKYC, audit log` | Nen tach thanh support, review moderation, eKYC approval, audit/payment logs de diagram ro hon. |
| Chua co `Dashboard` | Nen them `A-xx Xem dashboard`, code co `/dashboard/**`. |
| Chua co `Voucher management` cho admin/staff | Nen them, code co `/vouchers/**`. |
| Chua co `Rental device management` | Nen them neu do an can mo ta van hanh thue thiet bi chi tiet. |
| `SA-01 Quan ly RBAC` | Dung, nhung nen ghi ro Admin chi read role/permission, Super Admin moi write/assign. |

## Recommended Use Case Set Cho Diagram Tong Hop

Neu ve 1 diagram duy nhat, nen dung nhom use case sau de khong qua roi:

### Guest

- Xem catalog
- Dang ky/kich hoat
- Gui ho tro

### Customer

- Xac thuc
- Quan ly ho so va dia chi
- Quan ly gio hang
- Mua hang va thanh toan
- Theo doi don mua
- Thue thiet bi va ky hop dong
- Thanh toan phi thue
- eKYC
- Danh gia/report review

### Staff

- Xem dashboard
- Xem catalog noi bo
- Xem audit ton kho
- Quan ly don mua
- Xu ly vong doi don thue
- Quan ly thiet bi cho thue
- Xu ly support ticket
- Quan tri review
- Duyet eKYC
- Xem voucher va doi trang thai voucher
- Xem audit/payment log
- Xem user/address

### Admin

- Tat ca use case Staff
- Quan ly catalog
- Dieu chinh ton kho
- Tao/sua voucher
- Quan ly user
- Quan ly dia chi user
- Xem role/permission

### Super Admin

- Tat ca use case Admin
- Quan ly role
- Quan ly permission
- Gan permission cho role

### External Actors

- VNPay: xu ly payment return/IPN cho don mua va phi thue.
- Mail Service: gui email kich hoat, reset password, OTP ky hop dong neu service mail duoc dung trong flow.

## Unresolved Questions

- Co can tach `Staff` va `Admin` thanh 2 actor rieng trong diagram khong? Theo code nen tach.
- Co can them actor `Mail Service` cho OTP ky hop dong rental khong? Can doi chieu service mail implementation neu muon chinh xac tuyet doi.
- Co can the hien `Payment Transaction Log` trong diagram use case hay chi de trong admin/audit docs?
