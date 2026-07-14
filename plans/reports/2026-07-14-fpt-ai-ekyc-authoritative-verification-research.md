# FPT.AI eKYC authoritative verification research

## Kết luận

**Không có bằng chứng tài liệu rằng endpoint OCR LensHub đang dùng (`POST https://api.fpt.ai/vision/idr/vnm/`) tự đối soát dữ liệu CCCD với CSDL quốc gia/C06.** Tài liệu chính thức của chính endpoint này chỉ mô tả nhận ảnh, trích xuất trường, loại giấy tờ, probability và lỗi ảnh/OCR. FPT.AI **có** năng lực xác minh C06 trong bộ giải pháp eKYC đầy đủ, nhưng tài liệu tách nó thành luồng NFC/chip và kết quả `verifyCode` / `authentication_check`; khách hàng còn có thể chỉ dùng bước đọc chip mà chưa gọi C06.

Với code hiện tại, LensHub chỉ dùng OCR field/confidence, face match và một phần liveness/spoof. LensHub không gọi quality-check, fraud-check, QR, NFC/chip hoặc C06 API; không parse `verifyCode` hay `authentication_check`. Vì vậy không được mô tả LensHub là “xác minh CCCD với CSDL dân cư”. Mô tả đúng: **trích xuất dữ liệu từ ảnh + so khớp khuôn mặt + kiểm tra liveness, rồi đánh điểm rủi ro nội bộ và bắt buộc manual review**.

## Ma trận năng lực và ý nghĩa

| Năng lực | Tài liệu chính thức nói gì | Có phải xác minh C06? | LensHub hiện dùng |
|---|---|---:|---:|
| OCR/ID Recognition legacy | `/vision/idr/vnm/`: trả text trên CMT/CCCD, probability, type, lỗi ảnh/crop | Không có trường/bằng chứng C06 trong contract công khai | Có |
| Quality check | Endpoint riêng `/vision/idr-qual/vnm`, hoặc query `quality_check=1`; trả blur, luminance, resolution, bright spots, document ratio | Không | Không |
| Fraud/document checks | Endpoint riêng `/vision/vnm/id-fraudcheck`; tín hiệu recapture, edited, photocopy, corner, emblem, QR/chip/MRZ có bị che/mất, watermark... | Không; đây là tín hiệu ảnh/tài liệu xác suất | Không |
| Post-check | Kiểm tra logic nội bộ của dữ liệu OCR: format ID/ngày, mã năm sinh/giới tính, hạn thẻ, quan hệ ngày cấp-hết hạn | Không | Không |
| Face match | Hai ảnh có cùng người hay không; `isMatch` dựa ngưỡng 80%, trả similarity | Không | Có |
| Liveness | Người trong video có sống thật; trả `is_live`, spoof/deepfake probability, warning, review signal; có thể kèm face match | Không | Có một phần |
| QR | Luồng eKYC `/qrcode` so dữ liệu QR với OCR trước đó | Không; đây là đối chiếu hai biểu diễn trên thẻ | Không |
| NFC/chip integrity | `/check_chip` nhận DG/SOD/challenge; trả integrity/clone/authentication checks | Chỉ `authentication_check=True` được tài liệu định nghĩa là C06 thành công | Không |
| Verify C06 | Module riêng xác minh dữ liệu chip với CSDL quốc gia; `verifyCode=1` thành công, `0` thất bại, `2` chưa xác thực | Có | Không |

## Bằng chứng chính thức

1. Legacy ID Recognition mà LensHub cấu hình: https://docs.fpt.ai/docs/vi/vision/api/id-recognition/
   - URL đúng là `https://api.fpt.ai/vision/idr/vnm/`.
   - Contract mô tả trích xuất text, probability, type và lỗi. Không liệt kê C06/authoritative verification field.
2. Tổng quan FPT AI eKYC: https://docs-vision.fpt.ai/ekyc/I-introduction/gioi-thieu/
   - Phân biệt OCR, quality, fraud, face match, liveness và Verify C06.
   - Verify C06 được định nghĩa là xác minh dữ liệu/thông tin chip với CSDL quốc gia.
3. Tính năng FPT AI eKYC: https://docs-vision.fpt.ai/ekyc/I-introduction/tinh-nang-chinh/
   - OCR chỉ là trích xuất.
   - Fraud check là phát hiện khả năng chỉnh sửa/không đúng bản gốc.
   - NFC/C06 có 3 bước: đọc chip, gửi certificate để BCA xác thực, nhận TRUE/FALSE.
   - Tài liệu nói khách hàng có thể chỉ dùng bước 1; khi đó chưa thể xem là C06 verified.
4. Full eKYC APIs: https://docs-vision.fpt.ai/ekyc/III-integration/III-2-APIs/a-APIs%20of%20eKYC%20Flows/APIs-in-update-information-flow/
   - `/check_chip` trả `verifyCode`, `verifyMessage`, `integrity_check`, `clone_check`, `authentication_check`.
   - `authentication_check=True`: C06 thành công; `False`: thất bại; `N/A`: chưa xác thực.
   - Sample chính thức còn minh họa `verifyCode: 2`, “Chưa xác thực thông tin C06” dù integrity/clone là true: chip integrity không đồng nghĩa C06.
   - `/qrcode` chỉ “so khớp với kết quả OCR ở bước trước”.
5. Quality check: https://docs-vision.fpt.ai/ekyc/III-integration/III-2-APIs/b-APIs%20of%20AI%20Engine/vnm-id-quality-check/
6. OCR + fraud/post-check: https://docs-vision.fpt.ai/ekyc/III-integration/III-2-APIs/b-APIs%20of%20AI%20Engine/vnm-id/
   - Endpoint khác legacy LensHub: `/vision/vnm/id-fraudcheck`.
   - Fraud fields là tín hiệu hình ảnh/tài liệu.
   - QR comparison so QR với OCR.
   - Post-check là kiểm tra cấu trúc và tính nhất quán, không phải population lookup.
7. Face match: https://docs.fpt.ai/docs/en/vision/api/face-match/
8. Liveness v3: https://docs.fpt.ai/docs/en/vision/api/liveness/

## LensHub thực sự tiêu thụ gì

### Endpoint

`KycProviderProperties.java:21-23` cấu hình đúng ba endpoint legacy/AI-engine độc lập:

- `https://api.fpt.ai/vision/idr/vnm/`
- `https://api.fpt.ai/dmp/checkface/v1`
- `https://api.fpt.ai/dmp/liveness/v3`

### OCR

`FptKycProvider.java:144-166` gọi IDR một ảnh mỗi request. Parser chỉ lấy `id`, `name`, `dob`, `sex`, `nationality/ethnicity`, `home`, `address`, `issue_date`, `doe`, probability trung bình, `type/type_new`, và `errorCode`. Không parse fraud, post-check, QR, chip hay C06.

Hai mặt được gọi riêng (`:71-72`) rồi merge nội bộ (`KycVerificationProcessor.java:110-125`). Cách này không tận dụng contract hai-mặt của fraud/post-check endpoint.

### Face match

`FptKycProvider.java:173-203` gửi ảnh mặt trước và selfie, chỉ dùng `similarity` và `isMatch` (fallback ngưỡng 80). Nó chứng minh độ tương đồng khuôn mặt, không chứng minh dữ liệu CCCD có thật.

### Liveness

`FptKycProvider.java:206-229` dùng score/is-live, spoof probability/flag và optional multiple-face flags. Nhưng không tiêu thụ các output chính thức `need_to_review`, `is_deepfake`, `deepfake_prob`, `warning`, code lỗi chi tiết; cũng bỏ qua `face_match` nằm trong response liveness. Với code 408 “nhiều khuôn mặt”, parser không chắc đặt `multipleFacesDetected=true` vì tài liệu thể hiện qua code, còn parser tìm boolean field.

### Quyết định LensHub

`KycRiskScoringService.java:36-88` chỉ chấm thiếu field, hết hạn, OCR confidence, face match, liveness/spoof/multiple face, và số CCCD trùng **trong DB LensHub**. Trùng nội bộ không phải population verification. `manualReviewRequired` luôn true.

`KycVerificationProcessor.java:128-146` đặt `documentTampered=false` cố định và `documentValid/fieldsMatchProfile` theo risk nội bộ. Các tên này dễ bị hiểu quá mức: không phải kết quả authenticity/C06.

## Mitigation xếp hạng

1. **P0 — Sửa claim và decision semantics ngay:** chỉ nói “OCR + biometric checks”; không nói “C06 verified/CCCD authentic”. Manual review tiếp tục là hard gate. UI/admin phải phân biệt `AI checks passed`, `document fraud not checked`, `C06 not checked`. Không dùng `documentTampered=false` làm bằng chứng.
2. **P1 — Tiêu thụ đầy đủ output hiện có:** parse code/error; `need_to_review`, deepfake, warning; xử lý multiple-face theo code; fail/review khi thiếu signal. Đây là hardening liveness, chưa tạo C06 verification.
3. **P1 — Thêm quality + fraud + two-side post-check/QR consistency:** tích hợp endpoint/flow được contract hỗ trợ, lưu raw evidence và từng signal. Dùng để giảm giả mạo ảnh/tài liệu; vẫn ghi rõ probabilistic/non-authoritative.
4. **P2 — Muốn authoritative thì tích hợp full eKYC NFC/C06:** dùng Mobile SDK/NFC hoặc full-session API theo hợp đồng FPT/BCA; chỉ coi verified khi `verifyCode=1` và `authentication_check=True`, đồng thời kiểm tra integrity/clone. `verifyCode=2`, `N/A`, timeout phải là chưa xác minh, không phải pass.
5. **P2 — Governance:** xác nhận điều kiện thương mại/pháp lý truy cập C06, consent, retention, encryption, audit và fallback cho thiết bị không NFC trước triển khai. Cho đến lúc đó dùng manual review và giới hạn nghiệp vụ/rủi ro thuê.

## Câu trả lời bảo vệ ngắn

> FPT.AI có module đối soát C06, nhưng endpoint OCR LensHub đang gọi không phải module đó. LensHub hiện trích xuất thông tin trên ảnh, so khớp khuôn mặt và kiểm tra liveness; sau đó đánh rủi ro và chuyển người duyệt. Fraud check, QR, NFC và C06 là các bước/API riêng. Vì vậy hệ thống hiện không thể khẳng định số CCCD tồn tại hoặc dữ liệu khớp CSDL dân cư. Nếu cần mức xác minh có thẩm quyền, phải tích hợp luồng NFC/C06 và chỉ pass khi nhận `authentication_check=True`/`verifyCode=1`.

## Unresolved questions

1. API key/gói FPT hiện tại của LensHub có entitlement cho fraud-check, full eKYC session, NFC và C06 không?
2. FPT/BCA yêu cầu hợp đồng, loại pháp nhân, consent và retention cụ thể nào cho use case cho thuê thiết bị?
3. Response production thực tế của liveness v3 có luôn theo schema nested mới không, và mã 408/406 được trả HTTP hay JSON code?
4. LensHub có app mobile/NFC path không, hay cần FPT Web/Mobile SDK và fallback manual cho thiết bị không hỗ trợ NFC?

**Status:** DONE_WITH_CONCERNS  
**Summary:** Đã đối chiếu official docs với code. FPT có module C06 riêng; LensHub không gọi/tiêu thụ module đó và chỉ có OCR + face + partial liveness + risk nội bộ.  
**Concerns/Blockers:** `documentTampered=false` và tên `documentValid` có thể tạo claim sai; nhiều liveness/fraud/C06 signals hiện không được xử lý.
