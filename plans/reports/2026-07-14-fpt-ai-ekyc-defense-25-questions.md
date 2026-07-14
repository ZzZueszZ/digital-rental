# 25 câu hỏi-đáp bảo vệ AI eKYC/FPT AI

## 1. LensHub dùng AI eKYC để làm gì?

**Trả lời 30–60 giây:**

LensHub dùng AI để hỗ trợ ba việc: OCR trích thông tin từ ảnh CCCD, face match so ảnh chân dung trên thẻ với selfie, và liveness kiểm tra người quay video có dấu hiệu là người thật. Sau đó hệ thống tự chấm rủi ro dựa trên dữ liệu thiếu, confidence, hết hạn, face match, liveness và số CCCD trùng trong LensHub. Kết quả chưa tự động xác minh danh tính có thẩm quyền; mọi hồ sơ vẫn yêu cầu nhân viên duyệt. Vì vậy em mô tả đây là quy trình **AI-assisted KYC**, không phải hệ thống tự xác minh C06 hoàn toàn.

## 2. OCR có xác nhận số CCCD tồn tại trong CSDL dân cư không?

**Trả lời 30–60 giây:**

Không. Endpoint LensHub gọi là `https://api.fpt.ai/vision/idr/vnm/`. Contract chính thức của endpoint này mô tả trích xuất text, loại giấy tờ, probability và lỗi ảnh/OCR; không có trường kết quả C06. OCR chỉ trả lời “trên ảnh có vẻ ghi gì”, không trả lời “thông tin đó có thật trong CSDL quốc gia hay không”. FPT.AI có module Verify C06 riêng trong full eKYC/NFC flow, nhưng LensHub chưa tích hợp. Đây là ranh giới em phải nói rõ để không phóng đại năng lực hệ thống.

## 3. Confidence OCR cao có chứng minh CCCD thật không?

**Trả lời 30–60 giây:**

Không. Confidence cao chỉ cho biết mô hình tự tin rằng nó đọc đúng ký tự trên ảnh. Một ảnh CCCD chỉnh sửa đẹp, rõ và đúng font vẫn có thể cho confidence cao. Trong LensHub, confidence là trung bình một số trường như số ID, tên, ngày sinh, địa chỉ, quê quán, ngày cấp và hết hạn; dưới 0,70 tăng 30 điểm rủi ro, từ 0,70 đến dưới 0,90 tăng 15 điểm. Nó là tín hiệu chất lượng OCR, không phải authenticity score hay kết quả đối soát dân cư.

## 4. Nếu người dùng sửa tên hoặc số CCCD bằng Photoshop thì sao?

**Trả lời 30–60 giây:**

Với integration hiện tại, nếu ảnh chỉnh sửa đủ rõ, OCR có thể đọc đúng phần đã sửa và coi request thành công. Face match cũng có thể pass nếu ảnh chân dung vẫn là chính người nộp. Liveness chỉ chứng minh có một người thật trước camera. Vì LensHub chưa gọi fraud-check, QR comparison, NFC hoặc C06, một hồ sơ chỉnh sửa tinh vi có khả năng qua các bước tự động và đến manual review. Cách giảm rủi ro là tích hợp fraud/post-check trước, và nếu cần xác minh có thẩm quyền thì thêm NFC/C06.

## 5. FPT.AI có phát hiện CCCD chỉnh sửa không, hay LensHub nói sai?

**Trả lời 30–60 giây:**

FPT.AI có dịch vụ fraud-check riêng tại `/vision/vnm/id-fraudcheck`. Tài liệu liệt kê tín hiệu như edited, recaptured từ màn hình, photocopy, cắt góc, che quốc huy, thiếu QR/chip/MRZ, watermark và các chi tiết bảo an. Tuy nhiên LensHub đang gọi endpoint OCR legacy `/vision/idr/vnm/`, không gọi fraud-check và parser cũng không đọc `checking_result`. Vì vậy nói chính xác là **nền tảng FPT có khả năng**, nhưng **phiên bản tích hợp LensHub hiện chưa sử dụng khả năng đó**.

## 6. Fraud-check pass có đồng nghĩa giấy tờ thật không?

**Trả lời 30–60 giây:**

Không nên kết luận tuyệt đối. Fraud-check là tập tín hiệu xác suất trên ảnh: có dấu hiệu chỉnh sửa, chụp lại màn hình, photocopy, che hoặc thiếu thành phần bảo an hay không. “Không phát hiện nghi ngờ” khác với “được cơ quan có thẩm quyền xác nhận là thật”. Mô hình luôn có false negative; giấy giả chất lượng cao vẫn có thể qua. Em dùng fraud-check để giảm rủi ro và định tuyến manual review, còn kết luận có thẩm quyền phải dựa trên chip được xác thực hoặc C06 khi có quyền tích hợp.

## 7. Post-check của FPT khác đối soát C06 thế nào?

**Trả lời 30–60 giây:**

Post-check kiểm tra tính hợp lý nội bộ của dữ liệu OCR, ví dụ cấu trúc số ID, định dạng ngày sinh, mã giới tính/năm sinh trong số CCCD, giấy tờ hết hạn, quan hệ giữa ngày cấp và ngày hết hạn, hoặc hai mặt có cùng loại giấy tờ không. Đây là rule-based consistency check trên dữ liệu đã đọc. Nó có thể phát hiện dữ liệu vô lý, nhưng một bộ dữ liệu giả được tạo đúng quy tắc vẫn có thể pass. C06 là đối chiếu với nguồn dữ liệu có thẩm quyền; hai khái niệm không thể thay thế nhau.

## 8. Quét QR trên CCCD có đủ xác thực không?

**Trả lời 30–60 giây:**

Không. Trong tài liệu full eKYC, API QR so nội dung QR với kết quả OCR trước đó. Nó giúp phát hiện trường trên bề mặt khác với chuỗi QR, nhưng cả hai có thể nằm trên cùng một giấy tờ giả hoặc cùng bị làm lại. QR consistency không chứng minh dữ liệu tồn tại trong CSDL dân cư và không tương đương chữ ký số của chip. QR là lớp kiểm tra rẻ, hữu ích trước fraud/manual review; không nên gắn nhãn “C06 verified” chỉ vì QR khớp.

## 9. NFC/chip và C06 có phải một bước duy nhất không?

**Trả lời 30–60 giây:**

Không. Tài liệu FPT tách ba bước: đọc dữ liệu chip bằng Mobile SDK; gửi certificate/chữ ký để dịch vụ BCA kiểm tra tính toàn vẹn và hợp lệ; nhận kết quả xác minh. Khách hàng có thể chỉ dùng bước đọc chip. Sample chính thức còn cho thấy `integrity_check=true`, `clone_check=true` nhưng `verifyCode=2`, `authentication_check=N/A`, tức là **chưa xác thực C06**. Vì vậy LensHub chỉ được coi là xác minh có thẩm quyền khi flow trả rõ `verifyCode=1` và `authentication_check=True`, không phải chỉ vì đọc được NFC.

## 10. Tại sao LensHub chưa tích hợp C06 ngay?

**Trả lời 30–60 giây:**

C06 không chỉ là thêm một HTTP call. Nó cần gói dịch vụ và quyền truy cập phù hợp, hợp đồng với nhà cung cấp/BCA, consent và chính sách bảo vệ dữ liệu, Mobile SDK hoặc thiết bị NFC, quản lý session, audit và fallback cho máy không hỗ trợ NFC. Trong phạm vi KLTN, LensHub triển khai lớp OCR và sinh trắc học trước, kèm manual review để không tự động tin kết quả AI. Bước tiếp theo là xác nhận entitlement/pháp lý rồi mới thiết kế full eKYC NFC/C06, tránh mô phỏng một xác minh mà hệ thống thực tế không có.

## 11. Face match đang so gì và không so gì?

**Trả lời 30–60 giây:**

LensHub gửi ảnh mặt trước CCCD và selfie đến FPT Face Match. API trả `similarity` và `isMatch`; tài liệu dùng ngưỡng 80%. Kết quả cho biết hai khuôn mặt có khả năng thuộc cùng một người. Nó không kiểm tra số CCCD có tồn tại, thông tin chữ có khớp C06, hay thẻ có phải bản gốc. Nếu kẻ gian tự tạo CCCD giả nhưng dùng chính ảnh của mình, face match vẫn có thể pass đúng chức năng. Do đó face match là kiểm tra quyền sở hữu khuôn mặt trên tài liệu, không phải kiểm tra pháp lý tài liệu.

## 12. Vì sao chọn threshold face match 80? Có tối ưu cho LensHub chưa?

**Trả lời 30–60 giây:**

Ngưỡng 80 hiện bám theo contract FPT và `isMatch` của nhà cung cấp; LensHub chưa có tập dữ liệu gán nhãn riêng để chứng minh đây là ngưỡng tối ưu cho khách thuê thiết bị. Ngưỡng cao giảm false accept nhưng tăng false reject; ngưỡng thấp làm ngược lại. Với tài sản thuê giá trị cao, nên đánh giá theo risk tier: ngưỡng cao hoặc manual review tăng cường cho đơn giá trị lớn. Trước production cần đo ROC/DET trên dữ liệu consented, theo thiết bị và điều kiện ánh sáng, rồi chọn ngưỡng theo chi phí sai lầm nghiệp vụ.

## 13. False accept và false reject là gì trong hệ thống này?

**Trả lời 30–60 giây:**

False accept là hồ sơ không hợp lệ nhưng hệ thống cho qua, ví dụ hai người khác nhau vẫn face-match hoặc video giả bị coi là live. Đây là rủi ro thất thoát tài sản. False reject là khách hợp lệ bị từ chối do ảnh mờ, ánh sáng kém, ngoại hình thay đổi hoặc camera yếu; đây là rủi ro trải nghiệm và mất khách. Không thể tối ưu cả hai về 0. LensHub nên báo cáo FAR/FRR riêng theo từng bước, không chỉ “accuracy”, và dùng vùng không chắc chắn để chuyển manual review thay vì ép pass/fail tuyệt đối.

## 14. Liveness chứng minh điều gì?

**Trả lời 30–60 giây:**

Liveness kiểm tra video có dấu hiệu của người thật đang ở trước camera, hạn chế ảnh in, video quay lại, màn hình hoặc deepfake. FPT v3 trả `is_live`, spoof probability, `need_to_review`, deepfake signal, warning và có thể kèm face match. Nhưng ngay cả liveness pass cũng chỉ chứng minh phiên có người thật; nó không chứng minh tên, số CCCD hay địa chỉ là thật. Trong LensHub, liveness phải được kết hợp face match, document checks và manual/C06 verification tùy mức rủi ro.

## 15. LensHub đã xử lý đầy đủ response liveness của FPT chưa?

**Trả lời 30–60 giây:**

Chưa. Parser hiện lấy score hoặc `is_live`, spoof probability/flag và một số alias cho multiple faces. Nó chưa tiêu thụ `need_to_review`, `is_deepfake`, `deepfake_prob`, `warning` và code lỗi chi tiết. Response liveness còn có face match nhưng LensHub bỏ qua vì đã gọi Face Match riêng. Đây là giới hạn cần thừa nhận: integration mới dùng tập con của contract. Ưu tiên gần nhất là parse schema chính thức đầy đủ, fail closed khi signal thiếu hoặc bất thường, và đưa deepfake/warning vào risk/manual review.

## 16. Hai khuôn mặt trong video được xử lý thế nào?

**Trả lời 30–60 giây:**

FPT document mã hóa trường hợp nhiều hơn một khuôn mặt bằng code 408. Parser LensHub lại chủ yếu tìm các boolean như `multiple_faces_detected` hoặc `multipleFaces`. Nếu production response chỉ trả code mà không có boolean, LensHub có thể không đánh dấu cờ multiple faces dù request thất bại theo contract. Đây là integration gap, không nên che giấu. Cần map code 408 thành hard failure/manual review, lưu raw response, và có contract tests với sample thành công, 406 chất lượng kém, 408 nhiều mặt, 413 video tĩnh.

## 17. Nếu FPT timeout hoặc không truy cập được thì LensHub làm gì?

**Trả lời 30–60 giây:**

OCR và face-match hiện có thể làm quá trình submit lỗi; riêng liveness bắt exception rồi trả kết quả fail với score 0 và đánh dấu unavailable trong raw response. Risk service sau đó cộng điểm liveness failed và manual review luôn bật. Nguyên tắc an toàn là không biến lỗi nhà cung cấp thành pass. Fallback phù hợp là cho người dùng thử lại có giới hạn, lưu trạng thái `verification unavailable`, rồi chuyển nhân viên xử lý; không tự động duyệt. Production nên thêm retry có backoff, circuit breaker, idempotency và monitoring theo endpoint.

## 18. Điểm rủi ro LensHub được tạo thế nào? Có phải điểm của FPT không?

**Trả lời 30–60 giây:**

Đó là điểm nội bộ LensHub, không phải risk score chính thức của FPT. Hệ thống cộng điểm khi thiếu số CCCD, tên, ngày sinh, nơi cư trú; giấy tờ hết hạn; OCR confidence thấp; face match hoặc liveness fail; spoof/multiple face; hay số CCCD đã được tài khoản khác dùng trong LensHub. Từ 70 là high risk, 25 đến dưới 70 là medium. Rule này minh bạch và phù hợp MVP, nhưng chưa được hiệu chuẩn thống kê. Nó giúp sắp xếp manual review, không chứng minh danh tính hoặc xác suất gian lận thực tế.

## 19. `documentValid=true` trong database có nghĩa CCCD thật không?

**Trả lời 30–60 giây:**

Không. Trong code hiện tại, `documentValid` chỉ bằng việc risk level không phải high risk. `fieldsMatchProfile` cũng được gán cùng giá trị, còn `documentTampered` bị đặt cố định false dù chưa chạy fraud-check. Vì vậy tên field mạnh hơn bằng chứng thực tế. Khi bảo vệ, em diễn giải đây là “passed MVP validation”, không phải “document authenticated”. Hướng sửa là tách rõ `ocrComplete`, `fraudCheckStatus`, `nfcIntegrityStatus`, `c06VerificationStatus` và `manualDecision`; giá trị chưa kiểm tra phải là `NOT_CHECKED/UNKNOWN`, không phải false hoặc pass.

## 20. Kiểm tra số CCCD trùng trong LensHub có phải đối soát dân cư không?

**Trả lời 30–60 giây:**

Không. LensHub chỉ tìm số OCR trong bảng `UserIdentity` của chính hệ thống và cảnh báo nếu tài khoản khác đã dùng. Nó giúp chống một số trường hợp tái sử dụng danh tính trong phạm vi LensHub, nhưng không biết số đó có thật, thuộc ai trong dân cư, đã bị thu hồi hay thay đổi không. Đây là duplicate check nội bộ, không phải blacklist quốc gia hoặc C06. Em giữ kiểm tra này như tín hiệu fraud bổ sung, nhưng luôn ghi rõ phạm vi nguồn dữ liệu.

## 21. Manual review có giá trị gì nếu đã dùng AI?

**Trả lời 30–60 giây:**

AI giảm công việc lặp lại và đưa ra tín hiệu nhất quán; manual review xử lý vùng không chắc chắn và các tình huống ngoài phân phối mô hình. LensHub hiện đặt `manualReviewRequired=true` cho mọi phiên, nên AI chưa tự động quyết định quyền thuê. Nhân viên cần xem ảnh hai mặt, selfie/video, field OCR, raw warnings, trùng nội bộ và mức rủi ro. Tuy nhiên manual review cũng có sai sót; phải có checklist, phân quyền, audit người duyệt, lý do approve/reject và cơ chế four-eyes cho đơn giá trị cao. Đây là kiểm soát bù, không phải bằng chứng C06.

## 22. Làm sao bảo vệ dữ liệu CCCD và sinh trắc học?

**Trả lời 30–60 giây:**

Đây là dữ liệu nhạy cảm, nên nguyên tắc là thu tối thiểu, mục đích rõ, consent rõ, mã hóa khi truyền và lưu, phân quyền theo least privilege, URL/file không public, audit mọi lượt xem, retention ngắn và xóa có kiểm chứng. Log không được ghi ảnh, API key hay raw CCCD. Raw provider response cũng có PII nên phải bảo vệ như hồ sơ gốc. Trước tích hợp C06/NFC cần rà yêu cầu pháp lý và hợp đồng cụ thể. KLTN không nên tuyên bố compliance nếu chưa có legal review và evidence vận hành.

## 23. Có cần lưu toàn bộ ảnh/video và raw response mãi không?

**Trả lời 30–60 giây:**

Không. Lưu vô hạn tăng hậu quả nếu lộ dữ liệu và trái nguyên tắc data minimization. LensHub cần retention theo mục đích: đủ lâu cho duyệt hồ sơ, tranh chấp và nghĩa vụ pháp lý, sau đó xóa hoặc ẩn danh. Có thể lưu decision, timestamp, model/provider version và hash/evidence tối thiểu lâu hơn ảnh gốc nếu pháp lý cho phép. Retention phải khác giữa hồ sơ chưa hoàn thành, bị từ chối và khách đang có hợp đồng thuê. Chính sách phải được cấu hình, audit và thông báo cho người dùng, không chỉ ghi trong tài liệu.

## 24. AI eKYC có thiên lệch hoặc gây khó cho người dùng không?

**Trả lời 30–60 giây:**

Có thể. Chất lượng camera, ánh sáng, tuổi, thay đổi ngoại hình, kính/khẩu trang, màu da, khuyết tật vận động hoặc mạng yếu đều có thể làm tăng false reject. Chỉ công bố accuracy trung bình không đủ. LensHub cần theo dõi failure rate theo thiết bị và điều kiện chụp, không dùng thuộc tính nhạy cảm để phân biệt đối xử, cho phép retry có hướng dẫn, và cung cấp fallback manual hợp lý. Khi đánh giá model, dùng dữ liệu có consent, cân bằng và bảo vệ danh tính; không tự thu một bộ ảnh sinh trắc học tùy tiện.

## 25. Lộ trình nâng cấp eKYC nào thực tế nhất cho LensHub?

**Trả lời 30–60 giây:**

Em chia ba mức. P0: sửa claim và trạng thái, không gọi OCR là C06; giữ manual hard gate. P1: parse đầy đủ liveness code, deepfake, warning; thêm quality, fraud, post-check hai mặt và QR consistency, kèm contract tests và monitoring. P2: nếu nghiệp vụ và pháp lý yêu cầu, tích hợp full eKYC NFC/C06; chỉ pass authoritative khi `verifyCode=1`, `authentication_check=True`, đồng thời integrity/clone đạt. Sau đó hiệu chuẩn threshold bằng FAR/FRR và giá trị đơn thuê. Cách này tăng độ tin cậy từng lớp, không nhảy thẳng tới một claim chưa có bằng chứng.

## Evidence anchors

- FPT ID Recognition legacy: https://docs.fpt.ai/docs/vi/vision/api/id-recognition/
- FPT Face Match: https://docs.fpt.ai/docs/en/vision/api/face-match/
- FPT Liveness v3: https://docs.fpt.ai/docs/en/vision/api/liveness/
- FPT eKYC feature separation: https://docs-vision.fpt.ai/ekyc/I-introduction/tinh-nang-chinh/
- Full flow, NFC/C06 and QR: https://docs-vision.fpt.ai/ekyc/III-integration/III-2-APIs/a-APIs%20of%20eKYC%20Flows/APIs-in-update-information-flow/
- Fraud/post-check: https://docs-vision.fpt.ai/ekyc/III-integration/III-2-APIs/b-APIs%20of%20AI%20Engine/vnm-id/
- LensHub provider: `service/lenshub/src/main/java/org/web/identity/service/provider/FptKycProvider.java`
- LensHub risk rules: `service/lenshub/src/main/java/org/web/identity/service/KycRiskScoringService.java`
- LensHub persistence/decision mapping: `service/lenshub/src/main/java/org/web/identity/service/KycVerificationProcessor.java`

## Unresolved questions

1. FPT production response schema và entitlement thực tế của API key LensHub?
2. Yêu cầu hợp đồng/pháp lý để LensHub được Verify C06?
3. Risk appetite và giá trị đơn thuê nào cần enhanced/manual/C06 verification?
4. Retention cụ thể cho CCCD, selfie, video và raw provider response?

**Status:** DONE_WITH_CONCERNS  
**Summary:** 25 câu hỏi-đáp đã bám official FPT docs và code LensHub, phân biệt rõ OCR/AI signals với C06.  
**Concerns/Blockers:** Một số field hiện có tên mạnh hơn bằng chứng; liveness response chưa parse đầy đủ; chưa biết entitlement C06 của gói FPT.
