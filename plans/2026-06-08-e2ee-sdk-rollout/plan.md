# Kế Hoạch Áp Dụng E2EE Shield SDK

Ngày: 2026-06-08

## Mục Tiêu

Áp dụng E2EE Shield SDK vào luồng frontend/backend hiện tại để mã hóa các request nhạy cảm có JSON body, xác thực response mã hóa, chống replay cơ bản, và vẫn giữ ổn định các luồng public, multipart upload, VNPay callback.

Phạm vi hiện tại:

- Frontend: `frontend/src/lib/http.ts`, `frontend/src/lib/e2ee-shield-sdk/*`, `frontend/src/services/*`.
- Backend: `service/lenshub/src/main/java/org/web/e2ee/shield/sdk/*`.
- Cấu hình: `APP_E2EE_ENABLED`, `SERVER_IDENTITY_PRIV_B64`, `SERVER_IDENTITY_PUB_B64`, `NEXT_PUBLIC_E2EE_ENABLED`, `NEXT_PUBLIC_SERVER_JWK_X`, `NEXT_PUBLIC_SERVER_JWK_Y`.

Không làm trong đợt này:

- Không mã hóa multipart upload.
- Không mã hóa callback/IPN từ VNPay.
- Không mã hóa toàn bộ GET response nhạy cảm.
- Không chuyển session key store sang Redis ngay trong local rollout.

## Trạng Thái Hiện Tại

Đã có:

- SDK backend package chuẩn: `org.web.e2ee.shield.sdk`.
- FE interceptor trong `frontend/src/lib/http.ts`.
- Route policy FE/BE cho auth, eKYC, rental/order checkout, payment create, support, inventory, role/permission/user admin.
- Response envelope có `sessionId`, `aad`, `iv`, `cipherText`, `tag`.
- AAD request/response có `sessionId`, `method`, `path`, `timestamp`, `nonce`, `direction`.
- Replay cache theo session trong memory.
- `.env.example` đã được làm sạch khỏi private key thật.
- `services/api.ts` và `services/axios.ts` đã trỏ về `http.ts`.

Điểm cần xử lý trước khi bật rộng:

- `.env` đang từng bị Git track. Cần untrack và rotate secrets đã lộ trong repo/history.
- Backend đang chạy ở port `8080` có thể chưa nạp `APP_E2EE_ENABLED=true`; phải restart.
- Gradle test toàn dự án cần network/cache plugin đầy đủ; phiên hiện tại bị chặn tải plugin.

## Phase 0: Bảo Mật Secrets Và Baseline

Mục tiêu: không rollout trên nền secrets sai hoặc bị leak.

Việc cần làm:

1. Stop commit `.env` thật.
2. Untrack `.env` đã bị Git theo dõi:

```powershell
git rm --cached frontend/.env service/lenshub/.env
```

3. Rotate các secret đã xuất hiện trong repo:

- `SERVER_IDENTITY_PRIV_B64`
- `SERVER_IDENTITY_PUB_B64`
- `FPT_KYC_API_KEY`
- `MAIL_PASSWORD`
- `APP_JWT_SECRET`
- `APP_ACTIVATION_JWT_SECRET`
- VNPay `SECRET_KEY`, `TMN_CODE` nếu đã commit thật
- DB credential nếu dùng môi trường thật

4. Sinh lại identity key ECDSA P-256:

Backend cần:

```text
SERVER_IDENTITY_PRIV_B64=<base64 PKCS#8 private PEM>
SERVER_IDENTITY_PUB_B64=<base64 X.509 public PEM>
```

Frontend cần JWK public coordinates:

```text
NEXT_PUBLIC_SERVER_JWK_X=<public JWK x>
NEXT_PUBLIC_SERVER_JWK_Y=<public JWK y>
```

Điều kiện pass:

- `git status --short` không còn `.env` thật bị track.
- `frontend/.env.example` không chứa key thật.
- `service/lenshub/.env.example` không chứa key thật.
- FE public JWK khớp BE public key.

## Phase 1: Chạy Baseline Khi SDK Tắt

Mục tiêu: xác nhận app vẫn chạy bình thường trước khi bật mã hóa.

Cấu hình:

Backend:

```text
APP_E2EE_ENABLED=false
```

Frontend:

```text
NEXT_PUBLIC_E2EE_ENABLED=false
```

Restart cả hai app.

Test nhanh:

- Home/product detail load bình thường.
- Login/register/reset password bình thường.
- Checkout mua hàng.
- Checkout thuê.
- eKYC upload ảnh vẫn chạy.
- VNPay create URL và return/callback không bị ảnh hưởng.
- Admin roles/permissions/users vẫn thao tác được.

Điều kiện pass:

- Không có request nào gọi `/shield/handshake`.
- Không phát sinh lỗi 400/401 mới do SDK.
- FE lint/typecheck pass.

## Phase 2: Bật Backend Handshake Trước

Mục tiêu: backend expose `/api/shield/handshake` nhưng chưa bắt frontend mã hóa request.

Cấu hình:

Backend:

```text
APP_E2EE_ENABLED=true
SERVER_IDENTITY_PRIV_B64=<rotated-private-key>
SERVER_IDENTITY_PUB_B64=<rotated-public-key>
```

Frontend:

```text
NEXT_PUBLIC_E2EE_ENABLED=false
```

Restart backend.

Smoke test handshake:

```powershell
cd frontend
node .\scripts\verify-e2ee-handshake.mjs
```

Nếu chưa có script này, tạo script nhỏ làm:

- Generate ECDH P-256 client keypair.
- POST `/api/shield/handshake`.
- Verify response có `sessionId`, `serverPubJwk`, `serverNonceB64u`, `signatureB64u`.
- Verify signature bằng `NEXT_PUBLIC_SERVER_JWK_X/Y`.
- Derive AES key thành công.

Điều kiện pass:

- `/api/shield/handshake` trả `200`.
- Public key FE verify được chữ ký BE.
- App vẫn chạy plaintext vì FE flag đang off.

Rollback:

- Set `APP_E2EE_ENABLED=false`.
- Restart backend.

## Phase 3: Bật Frontend Cho Route Policy

Mục tiêu: route trong policy được mã hóa qua `http.ts`; route ngoài policy giữ nguyên.

Cấu hình:

Frontend:

```text
NEXT_PUBLIC_E2EE_ENABLED=true
NEXT_PUBLIC_SERVER_JWK_X=<rotated-public-jwk-x>
NEXT_PUBLIC_SERVER_JWK_Y=<rotated-public-jwk-y>
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Restart frontend.

Kiểm tra bằng DevTools network:

- Với protected route, request body phải là envelope:

```json
{
  "sessionId": "...",
  "aad": "...",
  "iv": "...",
  "cipherText": "...",
  "tag": "..."
}
```

- Không thấy plaintext password, note, address, checkout payload.
- Response protected route cũng là encrypted envelope trước khi interceptor decrypt.
- Multipart upload vẫn là `FormData`, không qua E2EE.

Điều kiện pass:

- Request protected gọi handshake một lần rồi dùng lại session.
- Response UI vẫn nhận JSON thường sau khi interceptor decrypt.
- Request policy ngoài phạm vi không bị mã hóa nhầm.

Rollback:

- Set `NEXT_PUBLIC_E2EE_ENABLED=false`.
- Restart frontend.
- Nếu cần, set luôn `APP_E2EE_ENABLED=false` và restart backend.

## Phase 4: Ma Trận Route Cần Kiểm Thử

Critical:

| Nhóm | Endpoint |
| --- | --- |
| Auth | `POST /auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`, `/auth/change-email` |
| eKYC | `POST /ekyc/submit`, `/ekyc/ocr-preview`; `PUT /admin/ekyc/{id}/approve`, `/reject` |
| Rental contract | `POST /rentals/{id}/contract/send-otp`, `/sign` |
| Staff rental | `POST /rentals/staff/{id}/prepare`, `/handover-report`, `/collect-deposit`, `/handover`, `/return-report`, `/complete` |
| Admin security | role/permission/user create/update/delete/reset/lock/unlock |
| Order status | `PATCH /orders/{id}/status` |

Sensitive:

| Nhóm | Endpoint |
| --- | --- |
| Profile | `PUT /profile` |
| Address | user/customer address create/update/delete/default |
| Checkout | `POST /orders/checkout`, `/orders/checkout/carts`, `/rentals/checkout` |
| Payment | `POST /payments/vnpay/create`, `/payments/vnpay/rental-fee/create` |
| Support | `POST /support/tickets`, `PUT /admin/support/tickets/{id}/status`, `/reply` |
| Inventory | stock update sale/rental |
| Rental devices | admin device create/update/status/delete |

Public/không mã hóa:

- `GET /products`, `/products/{id}`, `/categories`, review public reads.
- Uploads: `/uploads/**`.
- eKYC multipart uploads: `/ekyc/upload-front`, `/upload-back`, `/upload-selfie`, `/upload-liveness-video`.
- VNPay return/IPN: `/payments/vnpay/return`, `/ipn`, `/rental-fee/return`, `/rental-fee/ipn`.

## Phase 5: Negative Security Tests

Mục tiêu: xác nhận backend từ chối request bị sửa.

Test thủ công hoặc script:

1. Gửi protected endpoint plaintext khi E2EE on.
   - Expected: `400 e2ee_payload_required` hoặc `invalid_e2ee_payload`.
2. Sửa AAD method từ `POST` sang `PUT`.
   - Expected: `400 e2ee_method_mismatch`.
3. Sửa AAD path.
   - Expected: `400 e2ee_path_mismatch`.
4. Sửa timestamp lệch quá 2 phút.
   - Expected: `400 e2ee_timestamp_expired`.
5. Replay lại envelope cũ.
   - Expected: request đầu pass, request sau fail `e2ee_replay_detected`.
6. Sửa 1 byte `cipherText`.
   - Expected: `400 e2ee_processing_failed`, nonce chưa bị burn trước decrypt.
7. Sửa response envelope ở browser/dev proxy nếu có.
   - Expected: FE reject vì response AAD mismatch hoặc decrypt fail.

Điều kiện pass:

- Không case nào trả dữ liệu plaintext.
- Không lỗi stack trace ra client.
- Không log plaintext/ciphertext/key/session trong FE/BE.

## Phase 6: E2E Nghiệp Vụ

Luồng khách:

1. Register.
2. Login.
3. Cập nhật profile.
4. Thêm địa chỉ.
5. Checkout mua.
6. Checkout thuê.
7. Thanh toán lại order/rental fee nếu pending.
8. Gửi support ticket.
9. eKYC OCR preview, submit.
10. Upload ảnh eKYC phải vẫn chạy vì multipart bypass.

Luồng staff/admin:

1. Login admin/staff.
2. Duyệt eKYC approve/reject.
3. Prepare rental.
4. Handover report.
5. Collect deposit.
6. Complete rental.
7. Update inventory stock.
8. Create/update/delete role/permission.
9. Lock/unlock/reset password user.
10. Reply/update support ticket.

Luồng external:

1. VNPay create payment URL protected.
2. Redirect sang VNPay.
3. Return URL không bị E2EE filter chặn.
4. IPN không bị E2EE filter chặn.

Điều kiện pass:

- UI không đổi behavior.
- Network protected route không còn payload plaintext.
- Các callback external vẫn 200/redirect đúng.

## Phase 7: Tự Động Hóa Test

Backend unit/integration nên thêm:

- `E2eeRoutePolicyTest`: FE/BE route parity bằng danh sách route chung hoặc snapshot.
- `CryptoUtilTest`: encrypt/decrypt, invalid tag fail.
- `SessionKeyStoreTest`: TTL, replay, nonce limit.
- `E2eeShieldFilterTest`: plaintext rejected, valid envelope accepted, response encrypted, replay rejected.
- `HandshakeControllerTest`: invalid JWK/nonce fail, signature response valid.

Frontend tests nên thêm:

- `e2eeRoutePolicy.test.ts`: protected/public route mapping.
- `crypto.test.ts`: AES roundtrip, response AAD validation, replay nonce.
- `http.e2ee.test.ts`: interceptor encrypts only policy route, skips FormData, retries after expired session.

CI commands:

```powershell
cd service/lenshub
.\gradlew test

cd ..\..\frontend
pnpm lint
pnpm build
```

## Phase 8: Rollout Thứ Tự Theo Môi Trường

Local:

1. Rotate local E2EE key.
2. Restart backend with `APP_E2EE_ENABLED=true`.
3. Verify handshake.
4. Restart frontend with `NEXT_PUBLIC_E2EE_ENABLED=true`.
5. Run E2E smoke.

Staging:

1. Deploy backend first with SDK on.
2. Keep frontend E2EE off.
3. Verify handshake and public routes.
4. Deploy frontend with E2EE on.
5. Run full route matrix.
6. Monitor 400/401 spike for protected routes.

Production:

1. Use secret manager, not `.env` in repo.
2. Backend deploy with `APP_E2EE_ENABLED=true`.
3. Health check `/api/shield/handshake`.
4. Frontend deploy with matching public JWK.
5. Canary by admin/staff/internal account first.
6. Expand to all users.

## Monitoring Và Logging

Log nên có:

- Error code dạng `e2ee_method_mismatch`, `e2ee_replay_detected`.
- Route path/method.
- HTTP status.

Log không được có:

- plaintext body.
- ciphertext full body.
- AES key.
- session key.
- private key.
- password/token/OTP.

Metrics nên theo dõi:

- Handshake success/fail count.
- Protected request fail by reason.
- Replay detected count.
- Expired session retry count.
- Average protected request latency.
- VNPay callback success rate.

## Rollback

Rollback nhanh frontend:

```text
NEXT_PUBLIC_E2EE_ENABLED=false
```

Restart frontend. Backend có thể vẫn bật vì nếu frontend plaintext gửi vào protected route thì backend sẽ reject; vì vậy rollback frontend chỉ dùng khi route policy backend chưa bật hoặc cần tạm dừng người dùng trước khi tắt backend.

Rollback đầy đủ:

```text
NEXT_PUBLIC_E2EE_ENABLED=false
APP_E2EE_ENABLED=false
```

Restart frontend và backend.

Rollback code:

- Revert SDK integration commit.
- Đảm bảo `services/api.ts` và `services/axios.ts` không quay lại bypass auth/refresh sai.

## Tiêu Chí Nghiệm Thu

Được coi là áp dụng xong khi:

- FE/BE flags cùng trạng thái.
- Handshake pass và signature verify pass.
- Protected request body không còn plaintext trong Network tab.
- Protected response decrypt đúng trên UI.
- Multipart upload pass.
- VNPay return/IPN pass.
- Replay/tamper/timestamp tests fail đúng kỳ vọng.
- `pnpm lint`, `pnpm build`, `gradlew test` pass trong môi trường có dependency đầy đủ.
- `.env` thật không bị track bởi Git.
- Secrets đã rotate nếu từng lộ trong repo.

## Việc Nên Làm Sau Rollout

1. Chuyển `SessionKeyStore` sang Redis để chạy nhiều backend instance.
2. Tạo route policy source chung để FE/BE không bị lệch.
3. Thêm health endpoint nội bộ kiểm tra E2EE key loaded.
4. Thêm admin monitor cho E2EE error rate.
5. Mã hóa thêm response GET nhạy cảm nếu yêu cầu bảo mật cao hơn.
6. Dọn lịch sử Git hoặc rotate toàn bộ secrets đã từng commit.

## Câu Hỏi Chưa Chốt

- Môi trường production/staging sẽ dùng secret manager nào?
- Có yêu cầu E2EE cho GET response chứa thông tin nhạy cảm không?
- Có chạy nhiều backend instance không? Nếu có, cần Redis session store trước production.
- Có muốn canary theo user/role không, hay bật theo toàn frontend?
