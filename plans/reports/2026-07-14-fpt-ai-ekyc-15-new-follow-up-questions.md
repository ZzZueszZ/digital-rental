# 15 câu truy tiếp eKYC mới

## 1. Người nộp dùng đúng khuôn mặt và video thật, nhưng sửa phần chữ trên CCCD; bước nào sẽ chặn?

**Đáp:** Face match và liveness có thể cùng pass vì chúng đang làm đúng việc: xác nhận cùng khuôn mặt và người thật. Với LensHub hiện tại, không có bước tự động chắc chắn chặn phần chữ đã sửa vì chưa dùng fraud/QR/NFC/C06; hồ sơ phải dựa vào manual review. Đây là lý do không được suy từ “biometric pass” sang “identity data authentic”.

## 2. Nếu ảnh chân dung trên CCCD thật nhưng số CCCD bị thay, face match cao có làm tăng nguy hiểm không?

**Đáp:** Có thể tạo cảm giác tin cậy sai nếu reviewer nhìn mỗi face score. Face score chỉ củng cố quan hệ giữa selfie và chân dung, không củng cố số ID. UI nên tách rõ biometric evidence và document/data evidence, không gộp thành một nhãn xanh “đã xác minh”.

## 3. Có nên tăng threshold face match lên 95 để chống trường hợp này?

**Đáp:** Không giải quyết đúng nguyên nhân. Tăng threshold chỉ giảm nhầm khuôn mặt, không phát hiện text CCCD bị sửa khi chân dung vẫn đúng người; ngược lại còn tăng false reject. Mitigation đúng lớp là fraud/QR/NFC/C06 và manual review theo rủi ro.

## 4. Threshold có nên thay đổi theo giá trị thiết bị thuê không?

**Đáp:** Có thể dùng risk-based policy, nhưng phải hiệu chuẩn bằng dữ liệu và chi phí sai lầm. Đơn giá trị cao có thể yêu cầu vùng review rộng hơn, NFC/C06 hoặc kiểm tra bổ sung; không nên tùy ý đổi ngưỡng similarity mà không đo FAR/FRR. Policy và lý do phải version hóa, audit được.

## 5. Dữ liệu nào đủ để chứng minh threshold LensHub phù hợp?

**Đáp:** Cần tập genuine/impostor có consent, đại diện camera, ánh sáng, độ tuổi và điều kiện sử dụng thật; tách train/calibration/test để tránh leakage. Báo cáo ROC/DET, FAR tại các FRR, confidence interval và kết quả theo nhóm/thiết bị. Sample demo hoặc accuracy FPT công bố chung chưa đủ chứng minh ngưỡng tối ưu cho LensHub.

## 6. Nếu không có đủ mẫu gian lận thật, đánh giá false accept thế nào?

**Đáp:** Không được tạo kết luận chắc chắn từ vài ảnh thử tay. Có thể làm controlled red-team có consent, dùng attack taxonomy rõ: look-alike, printed photo, replay, edited text, recaptured screen, deepfake; sau đó báo giới hạn và interval. Trước khi đủ evidence, giữ manual hard gate và không tự động approve.

## 7. Consent “đồng ý eKYC” có đủ cho việc dùng video để huấn luyện model không?

**Đáp:** Không mặc nhiên. Consent xác minh danh tính và consent tái sử dụng dữ liệu sinh trắc học để training là hai mục đích khác nhau. Nếu muốn training/evaluation, cần căn cứ pháp lý, thông báo mục đích, phạm vi, thời hạn, quyền rút lại và cơ chế loại dữ liệu; lựa chọn từ chối không nên vô lý chặn dịch vụ cốt lõi.

## 8. Người dùng rút consent sau khi đã duyệt KYC thì LensHub phải xóa gì?

**Đáp:** Không thể trả lời “xóa tất cả ngay” nếu còn nghĩa vụ hợp đồng/pháp lý, cũng không thể giữ vô hạn. Cần inventory theo mục đích: ảnh/video, raw response, derived scores, audit decision, hợp đồng; xóa hoặc hạn chế xử lý phần không còn căn cứ, giữ tối thiểu phần bắt buộc và ghi rõ retention/legal hold. Yêu cầu xóa còn phải truyền đến provider nếu hợp đồng quy định.

## 9. Retention của FPT và retention của LensHub khác nhau thì ai chịu trách nhiệm?

**Đáp:** LensHub vẫn phải biết dữ liệu nào được gửi, FPT lưu bao lâu, ở đâu, subprocessor nào và cơ chế xóa ra sao; không thể giao toàn bộ trách nhiệm cho provider. Cần DPA/hợp đồng, cấu hình retention, bằng chứng xóa và quy trình xử lý sự cố. LensHub cũng phải áp retention riêng cho bản sao và raw response mình lưu.

## 10. Video thật có thể bị deepfake không, hay hai khái niệm loại trừ nhau?

**Đáp:** Không loại trừ. Một luồng có chuyển động “thật” vẫn có thể bị face-swap hoặc injection; replay là phát lại nội dung, deepfake là biến đổi/sinh nội dung, còn presentation attack có thể là ảnh/mặt nạ trước camera. Cần đọc riêng `is_live`, spoof/replay, deepfake và warning; LensHub hiện chưa parse đầy đủ deepfake signal.

## 11. Nếu FPT trả `is_live=true` nhưng `need_to_review=true` thì quyết định nào ưu tiên?

**Đáp:** Không được coi là pass sạch. `need_to_review` là tín hiệu bất định hoặc chất lượng cần người xem; policy an toàn là trạng thái `REVIEW_REQUIRED`, không ép về boolean pass. LensHub hiện chưa tiêu thụ field này, nên đây là gap cần sửa trước tự động hóa.

## 12. Nhân viên duyệt nhầm hồ sơ AI cảnh báo thì trách nhiệm thuộc AI hay nhân viên?

**Đáp:** Không nên thiết kế trách nhiệm mơ hồ. LensHub là bên ra quyết định nghiệp vụ; provider cung cấp tín hiệu theo contract, reviewer thực hiện policy. Cần lưu model/provider version, raw evidence, cảnh báo hiển thị, checklist, người duyệt và lý do override; đơn rủi ro cao nên có four-eyes. Audit trail giúp phân tích trách nhiệm, không biến AI thành chủ thể chịu lỗi.

## 13. Làm sao tránh reviewer bị automation bias khi thấy điểm AI cao?

**Đáp:** UI không nên có một “điểm tin cậy tổng” che mất nguồn bằng chứng. Hiển thị tách OCR quality, face, liveness, fraud, C06 và trạng thái `NOT_CHECKED`; bắt reviewer xem cảnh báo trọng yếu trước approve và nhập lý do override. Định kỳ đo tỷ lệ reviewer đồng ý máy, lỗi bỏ sót và quality audit trên mẫu ngẫu nhiên.

## 14. Nếu FPT đổi model nhưng giữ nguyên API, kết quả LensHub có còn so sánh được không?

**Đáp:** Không chắc. Model drift có thể đổi phân phối similarity, FAR/FRR và warning dù schema không đổi. LensHub cần lưu provider/model version nếu có, giám sát score distribution và pass rate, chạy regression/canary khi FPT thông báo nâng cấp, rồi hiệu chuẩn lại threshold; không giả định ngưỡng cũ vĩnh viễn đúng.

## 15. Có API `/check_chip` là LensHub đương nhiên được gọi C06 không?

**Đáp:** Không. Tồn tại endpoint trong tài liệu không chứng minh API key có entitlement, pháp nhân đủ điều kiện hay contract đã bật BCA verification. Chỉ coi C06 verified khi integration được cấp quyền và response cụ thể trả `verifyCode=1`, `authentication_check=True`; `2`, `N/A`, timeout hoặc provider unavailable đều là `NOT_VERIFIED`, không được fallback thành pass.

## Unresolved questions

1. Chưa có toàn văn “bộ 100” trong context để chạy kiểm tra trùng câu chữ tự động; 15 câu này được thiết kế tránh trùng bộ 25 eKYC trước và tập trung truy tiếp cấp hai.
2. Chưa có DPA/entitlement/model-version contract thực tế của FPT cho LensHub.

**Status:** DONE_WITH_CONCERNS  
**Summary:** Đã tạo 15 câu truy tiếp mới, tập trung attack chain, calibration evidence, consent/retention, deepfake ambiguity, reviewer liability, provider drift và C06 entitlement.  
**Concerns/Blockers:** Cần đối chiếu toàn văn bộ 100 để bảo đảm không trùng tuyệt đối.
