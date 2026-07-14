# 160 câu hỏi phản biện và trả lời bảo vệ KLTN LensHub

Ngày: 2026-07-14  
Phạm vi: nghiệp vụ bán/thuê, AI eKYC, E2EE-Shield, kiến trúc, kiểm thử, đóng góp đề tài.

## Cách trả lời trước Hội đồng

- Cấu trúc: **kết luận trực tiếp → bằng chứng nhóm có → giới hạn → hướng khắc phục**.
- Không biết số liệu: nói “nhóm chưa có dữ liệu để khẳng định”, không đoán.
- Không gọi prototype là production; không gọi OCR là đối soát C06; không gọi OTP là chữ ký số PKI.
- Các câu đánh dấu **🔥** là câu có xác suất bị hỏi hoặc dễ bị hỏi truy tiếp nhất.

---

## I. Nghiệp vụ bán và thuê thiết bị — Câu 1–25

### 1. LensHub giải quyết bài toán gì?

LensHub hỗ trợ đồng thời bán và thuê thiết bị nhiếp ảnh. Điểm khác biệt của luồng thuê là phải xác minh người thuê, kiểm tra khả dụng theo thời gian, quản lý từng thiết bị theo serial, hợp đồng, tiền cọc, bàn giao và hoàn trả. Nhóm tập trung tích hợp các nghiệp vụ này với eKYC và E2EE-Shield thành một prototype hoàn chỉnh.

### 2. Vì sao chọn máy ảnh thay vì sản phẩm thông thường?

Máy ảnh và ống kính có giá trị cao, dễ di chuyển, có nhu cầu thuê theo ngày và rủi ro mất hoặc hư hỏng lớn. Vì vậy bài toán buộc hệ thống phải xử lý danh tính, lịch thuê, tài sản vật lý, hợp đồng và cọc; đây là môi trường phù hợp để đánh giá eKYC và bảo vệ dữ liệu nhạy cảm.

### 3. Luồng mua hàng hoạt động thế nào?

Khách chọn sản phẩm, địa chỉ, voucher và phương thức thanh toán. Backend đọc lại giá và tồn kho từ cơ sở dữ liệu, tạo đơn `PENDING`, trừ kho, ghi audit log; sau đó đơn đi qua `CONFIRMED`, `SHIPPING`, `DELIVERED`, `COMPLETED`. Nếu thanh toán VNPay, kết quả hợp lệ được dùng cập nhật trạng thái thanh toán.

### 4. Tại sao không dùng giá do frontend gửi lên?

Frontend là môi trường người dùng kiểm soát nên giá có thể bị sửa bằng DevTools hoặc request giả. Backend chỉ nhận định danh sản phẩm và số lượng, sau đó đọc giá hiện hành từ database và tự tính tổng tiền. Đây là kiểm soát chống parameter tampering cơ bản.

### 5. **🔥 Hai người cùng mua sản phẩm cuối cùng thì sao?**

Phiên bản hiện tại còn race condition vì hai transaction có thể cùng đọc tồn kho bằng 1 rồi cùng trừ. `@Transactional` chỉ bảo đảm rollback/commit, không tự loại bỏ cạnh tranh. Cách sửa là cập nhật nguyên tử `UPDATE ... SET quantity = quantity - n WHERE quantity >= n` và kiểm tra số dòng cập nhật, hoặc dùng pessimistic/optimistic lock kèm integration test đồng thời.

### 6. Hai người cùng thuê slot cuối cùng thì sao?

Luồng thuê cũng có nguy cơ check-then-insert: cả hai cùng thấy còn một thiết bị khả dụng rồi cùng tạo đơn. Giải pháp là reservation có TTL, khóa tài nguyên hoặc time-slot ledger/exclusion constraint, sau đó test nhiều request đồng thời. Nhóm không nên khẳng định prototype đã loại bỏ hoàn toàn overbooking.

### 7. Transaction có giải quyết được oversell không?

Không nhất thiết. Transaction bảo đảm một chuỗi thao tác có tính nguyên tử trong chính transaction đó, nhưng hai transaction vẫn có thể đọc cùng một trạng thái nếu isolation và locking không phù hợp. Muốn chống oversell phải có điều kiện cập nhật nguyên tử, lock hoặc version kiểm soát xung đột.

### 8. **🔥 Hệ thống có tìm kiếm hoặc lọc theo hãng không?**

Backend hỗ trợ tham số `brand`, so khớp chính xác và không phân biệt hoa thường, ví dụ `?brand=Canon`. Tuy nhiên giao diện catalog khách hàng hiện chưa có bộ lọc hãng hoàn chỉnh và chưa gửi tham số này. Vì vậy tính năng mới hoàn thành ở mức API, chưa end-to-end.

### 9. Vì sao không dùng Elasticsearch cho tìm kiếm?

Quy mô prototype và tiêu chí hiện tại chỉ gồm tên, danh mục, mục đích và hãng nên truy vấn database đủ đơn giản. Elasticsearch chỉ hợp lý khi cần full-text nâng cao, typo tolerance, ranking và dữ liệu lớn. Dùng ngay sẽ tăng độ phức tạp mà chưa tạo giá trị tương xứng.

### 10. Brand trong hệ thống đã được chuẩn hóa chưa?

Chưa hoàn toàn. Hiện `brand` là chuỗi tự do, chưa có entity Manufacturer, alias hay quy tắc chuẩn hóa. Hướng phát triển là tạo bảng hãng riêng, dùng khóa ngoại, slug/alias và endpoint trả về danh sách hãng đang hoạt động.

### 11. **🔥 Làm sao chứng minh hàng chính hãng?**

Hiện LensHub chưa đủ bằng chứng để chứng minh. Hệ thống có brand, serial và lịch sử thiết bị, nhưng serial do nhân viên nhập chỉ hỗ trợ truy vết nội bộ. Muốn chứng minh nguồn gốc cần lưu nhà cung cấp được ủy quyền, hóa đơn nhập, bảo hành, chứng từ theo từng unit và nếu có thì xác minh serial qua hãng/nhà phân phối.

### 12. Serial có chứng minh hàng thật không?

Không. Serial cho biết LensHub đang theo dõi unit nào, trạng thái gì và đã giao cho ai. Serial giả hoặc sao chép vẫn có thể được nhập vào hệ thống. Vì vậy serial là traceability, không phải authenticity.

### 13. Nên sửa câu “chính hãng 100%” thế nào?

Nếu chưa có chuỗi chứng từ và xác minh với hãng, nên đổi thành “Thiết bị được LensHub kiểm tra trước khi giao” hoặc “Có thông tin serial và lịch sử quản lý”. Đây là claim đúng với bằng chứng kỹ thuật hiện có và tránh bị Hội đồng hỏi ngược.

### 14. Điều kiện để khách được thuê là gì?

Người dùng phải có trạng thái eKYC `VERIFIED`, khoảng ngày hợp lệ và sản phẩm còn khả dụng. Sau khi tạo đơn, phí thuê phải được thanh toán; trước bàn giao còn có bước gắn thiết bị vật lý, ký hợp đồng, thu cọc và lập biên bản.

### 15. Vòng đời đơn thuê gồm những trạng thái nào?

Luồng chính là `PENDING_PAYMENT → PAID_RENTAL_FEE → WAITING_PICKUP → RENTING → RETURNED → COMPLETED`, ngoài ra có `CANCELLED`. Mỗi chuyển trạng thái đại diện một kiểm soát nghiệp vụ như trả phí, chuẩn bị tài sản, ký hợp đồng, thu cọc, giao và nhận lại thiết bị.

### 16. Làm sao tính thiết bị khả dụng theo ngày?

Hệ thống lấy tổng số lượng cho thuê trừ số unit đã nằm trong các đơn giao thời gian với khoảng ngày yêu cầu. Tuy nhiên query hiện cần được rà lại trạng thái loại trừ và phải bổ sung kiểm thử runtime/concurrency. Nguyên tắc đúng là hai khoảng thời gian giao nhau thì cùng cạnh tranh một tài nguyên.

### 17. Nếu khách trả trễ hoặc làm hỏng thiết bị thì sao?

Nhân viên lập biên bản hoàn trả, ghi tình trạng, phí trễ và phí hư hỏng. Hệ thống có thể khấu trừ tiền cọc, ghi khoản cần thu thêm và chuyển thiết bị sang `AVAILABLE` hoặc `DAMAGED`. Giới hạn là nhiều khoản đang được xác nhận offline, chưa đối soát tự động với ngân hàng.

### 18. Tiền thuê và tiền cọc được quản lý khác nhau thế nào?

Phí thuê được thanh toán online qua VNPay. Tiền cọc hiện do nhân viên thu và xác nhận offline. Trước khi bàn giao, hệ thống kiểm tra phí thuê đã thành công, cọc đã thu và hợp đồng đã ký/khóa.

### 19. Hợp đồng được ký như thế nào?

Backend tạo hợp đồng nháp từ thông tin đơn và thiết bị. Hệ thống gửi OTP qua email; khách nhập OTP và thông tin chữ ký, sau đó lưu người ký, thời gian, IP, user-agent và hash tài liệu. Cơ chế này hỗ trợ xác nhận và audit trong prototype.

### 20. **🔥 OTP có phải chữ ký số hợp pháp không?**

Không nên gọi là chữ ký số PKI. OTP và hash tài liệu hỗ trợ xác nhận người đang kiểm soát email và phát hiện thay đổi nội dung, nhưng không có chứng thư số do CA cấp. Nếu cần giá trị pháp lý mạnh hơn phải tích hợp dịch vụ ký số, canonical document, timestamp và quy trình pháp lý phù hợp.

### 21. OTP hiện có hạn chế gì?

OTP có TTL và bị xóa sau khi ký, nhưng hiện cần bổ sung hash OTP khi lưu, số lần thử tối đa, rate limit, cooldown gửi lại và lockout. Những lớp này giảm brute force và abuse. Không nên nói OTP hiện an toàn tuyệt đối.

### 22. VNPay callback được tin cậy bằng cách nào?

Backend kiểm tra secure hash, trạng thái phản hồi, trạng thái giao dịch, số tiền và đơn tương ứng trước khi cập nhật. Xử lý callback cần idempotent vì VNPay có thể gửi lại. Không được chỉ tin tham số `success` hoặc redirect phía frontend.

### 23. Đơn online bỏ thanh toán giữ kho bao lâu?

Hiện kho mua bị trừ khi tạo đơn và chưa có cơ chế expiry/auto-cancel rõ cho giao dịch bỏ dở. Đây là hạn chế. Hướng sửa là inventory reservation có TTL, job giải phóng tồn hoặc chỉ xác nhận trừ kho theo chiến lược thanh toán phù hợp.

### 24. Đơn online chưa thanh toán có thể bị giao không?

Code hiện còn khả năng staff đẩy trạng thái giao hàng mà chưa gate chặt `paymentStatus`. Đây là gap tài chính cần sửa: đơn online chỉ được xác nhận/giao khi thanh toán thành công; COD chỉ ghi thành công khi đã thu tiền và có bằng chứng giao nhận.

### 25. Voucher có thể bị dùng vượt giới hạn không?

Nếu chỉ kiểm tra số lượt rồi tăng bộ đếm trong hai thao tác tách rời thì có nguy cơ race tương tự tồn kho. Cần cập nhật usage nguyên tử, unique constraint theo user/voucher nếu có giới hạn cá nhân và idempotency theo order. Đây là nội dung cần kiểm thử concurrency riêng.

---

## II. AI eKYC và FPT.AI — Câu 26–50

### 26. LensHub dùng eKYC để làm gì?

AI hỗ trợ OCR thông tin CCCD, face match giữa ảnh trên giấy tờ và selfie, liveness từ video, sau đó tạo tín hiệu rủi ro cho nhân viên duyệt. LensHub hiện là **AI-assisted KYC**; AI không tự tạo kết luận có thẩm quyền rằng danh tính tồn tại trong CSDL dân cư.

### 27. OCR thực hiện chức năng gì?

OCR nhận ảnh và trích xuất các trường như số CCCD, họ tên, ngày sinh, địa chỉ và confidence. Nó trả lời “trên ảnh ghi gì”, không trả lời “thông tin đó có thật hay do cơ quan nào cấp”.

### 28. **🔥 FPT OCR có đối soát CSDL dân cư/C06 không?**

Không có bằng chứng rằng endpoint LensHub đang dùng, `/vision/idr/vnm/`, tự đối soát C06. FPT.AI có các module NFC/C06 trong giải pháp đầy đủ, nhưng đó là luồng khác và LensHub chưa tích hợp. Vì vậy nhóm chỉ được nói OCR + biometric checks, không nói C06 verified.

### 29. Confidence OCR cao có chứng minh CCCD thật không?

Không. Confidence chỉ đo mức mô hình tin rằng đã đọc đúng ký tự trên ảnh. Một ảnh chỉnh sửa rõ, đúng font vẫn có thể cho confidence cao. Confidence là quality signal, không phải authenticity score.

### 30. **🔥 Người thật dùng CCCD đã chỉnh sửa rồi tự selfie/quay video thì sao?**

OCR có thể đọc phần đã chỉnh sửa; face match có thể pass nếu ảnh trên thẻ là chính người đó; liveness cũng pass vì trước camera đúng là người thật. Ba bước này không chứng minh dữ liệu trên CCCD hợp pháp. LensHub phải chuyển hồ sơ sang manual review; giải pháp mạnh hơn là fraud/post-check, NFC kiểm tra chip/chữ ký và C06 khi có quyền tích hợp.

### 31. Face match kiểm tra gì?

Face match đánh giá hai ảnh khuôn mặt có khả năng thuộc cùng một người hay không. Nó không xác minh số CCCD, địa chỉ, giấy tờ gốc hay dữ liệu C06. Nếu người gian lận tự tạo CCCD giả bằng ảnh của mình, face match vẫn có thể hoạt động “đúng” nhưng hồ sơ vẫn gian lận.

### 32. Liveness chứng minh gì?

Liveness đánh giá video có dấu hiệu của người thật đang hiện diện, nhằm hạn chế ảnh in, màn hình phát lại hoặc một số deepfake. Nó không chứng minh tên và số CCCD là thật. Liveness phải kết hợp face match, kiểm tra tài liệu và nguồn xác thực có thẩm quyền.

### 33. Nếu người dùng đưa video quay sẵn thì sao?

Liveness có thể tìm tín hiệu replay/spoof, nhưng không có mô hình nào bảo đảm phát hiện 100%. Cần challenge ngẫu nhiên, kiểm tra deepfake/replay, giới hạn retry và chuyển manual review khi cảnh báo. Prototype hiện chưa nên được mô tả là chống mọi video giả.

### 34. FPT có chức năng phát hiện tài liệu chỉnh sửa không?

Nền tảng FPT có fraud-check riêng với các tín hiệu như edited, recaptured, photocopy hoặc thiếu thành phần bảo an. Tuy nhiên LensHub hiện gọi OCR legacy và chưa tích hợp fraud-check đó. Phải phân biệt năng lực của nhà cung cấp với năng lực thực tế đã nối vào hệ thống.

### 35. Fraud-check pass có chứng minh giấy tờ thật không?

Không tuyệt đối. Nó cho biết mô hình chưa phát hiện dấu hiệu gian lận trong phạm vi đã học, vẫn có false negative. Xác minh có thẩm quyền cần chip/chữ ký hợp lệ hoặc đối soát nguồn chính thống.

### 36. Post-check khác C06 thế nào?

Post-check kiểm tra tính hợp lý nội bộ như định dạng số, quan hệ ngày cấp–hết hạn, cấu trúc trường và sự nhất quán hai mặt. Dữ liệu giả nhưng được tạo đúng quy tắc vẫn có thể pass. C06 là đối chiếu với nguồn dữ liệu có thẩm quyền.

### 37. QR trên CCCD có đủ để xác thực không?

Không. QR có thể được so với dữ liệu OCR để tìm mâu thuẫn, nhưng cả mặt thẻ và QR đều có thể bị làm giả. QR consistency là lớp kiểm tra bổ sung, không phải chữ ký số của chip và không tương đương C06.

### 38. NFC và C06 có phải cùng một việc không?

Không. NFC trước hết đọc dữ liệu chip; tiếp theo có thể kiểm tra tính toàn vẹn, chống clone và chữ ký; xác minh C06 là bước có quyền truy cập và kết quả riêng. Đọc được chip chưa tự động có nghĩa đã đối soát C06.

### 39. Tại sao chưa tích hợp C06?

C06 cần quyền dịch vụ, hợp đồng, yêu cầu pháp lý/consent, SDK NFC và quy trình vận hành phù hợp; không chỉ là thêm một API call. Trong phạm vi KLTN, nhóm dùng OCR, sinh trắc học và manual review, đồng thời nêu C06/NFC là hướng phát triển.

### 40. Ngưỡng face match được chọn thế nào?

Ngưỡng hiện bám contract/provider, chưa được tối ưu bằng dataset LensHub. Ngưỡng cao giảm false accept nhưng tăng false reject. Trước production cần ROC/DET, FAR/FRR trên dữ liệu có consent và chọn ngưỡng theo giá trị/rủi ro đơn thuê.

### 41. FAR và FRR là gì?

FAR là tỷ lệ người/hồ sơ không hợp lệ bị chấp nhận; FRR là tỷ lệ người hợp lệ bị từ chối. Giảm một loại thường làm tăng loại còn lại. Với tài sản giá trị cao, hệ thống nên ưu tiên giảm FAR nhưng dùng manual review để hạn chế ảnh hưởng FRR.

### 42. Độ chính xác eKYC của nhóm là bao nhiêu?

Nhóm chưa có dataset gán nhãn độc lập đủ đại diện để công bố accuracy, precision, recall, FAR hoặc FRR của toàn pipeline. Các score hiện chủ yếu do provider trả về. Vì vậy nhóm chỉ khẳng định đã tích hợp và kiểm thử luồng quyết định, không khẳng định độ chính xác AI tổng quát.

### 43. Điểm rủi ro là của FPT hay LensHub?

Đó là điểm nội bộ LensHub, tổng hợp thiếu dữ liệu, confidence, hết hạn, face/liveness, spoof và trùng CCCD nội bộ. Nó giúp ưu tiên hồ sơ review, không phải xác suất gian lận được hiệu chuẩn và không phải risk score chính thức của FPT.

### 44. Kiểm tra CCCD trùng trong LensHub có phải C06 không?

Không. LensHub chỉ biết số đó đã xuất hiện trong database của chính mình hay chưa. Nó không biết số đó có thật, thuộc ai, đã bị thu hồi hay thay đổi trong CSDL quốc gia.

### 45. Vì sao vẫn cần nhân viên duyệt khi đã có AI?

AI giảm việc đọc thủ công, chuẩn hóa tín hiệu và lọc trường hợp bất thường. Nhân viên xử lý vùng không chắc chắn và chịu trách nhiệm quyết định trong khi chưa có C06. Manual review phải có checklist, lý do duyệt/từ chối, audit và có thể four-eyes cho đơn giá trị cao.

### 46. Nếu FPT timeout thì hệ thống làm gì?

Nguyên tắc là fail closed: lỗi provider không được biến thành pass. Hệ thống nên lưu trạng thái `verification unavailable`, cho retry có giới hạn/backoff hoặc chuyển manual review. Production cần circuit breaker, idempotency và monitoring từng endpoint.

### 47. Hai khuôn mặt trong video xử lý thế nào?

Đây phải là hard failure hoặc manual review. LensHub hiện chưa parse đầy đủ mọi error code của contract liveness, nên cần map rõ trường hợp multiple faces, video tĩnh, chất lượng kém và deepfake warning, kèm contract tests.

### 48. Trường `documentTampered=false` có chứng minh không bị sửa không?

Không. Code hiện có trường được đặt mặc định dù chưa chạy fraud-check, nên tên trường mạnh hơn bằng chứng. Nên đổi thành trạng thái rõ như `fraudCheckStatus=NOT_CHECKED`, tách OCR, NFC, C06 và manual decision; không dùng boolean đó để claim CCCD thật.

### 49. Bảo vệ ảnh CCCD, selfie và video thế nào?

Phải thu tối thiểu, có mục đích/consent, TLS, storage private, least privilege, audit người xem, không log raw PII và có retention/xóa. E2EE-Shield hiện chưa mã hóa file multipart, vì vậy không được nói mọi file eKYC đã được E2EE bảo vệ.

### 50. Lộ trình nâng cấp eKYC hợp lý nhất là gì?

P0: sửa claim và trạng thái, giữ manual hard gate. P1: thêm quality/fraud/post-check/QR, parse đầy đủ liveness/deepfake và contract test. P2: khi đủ pháp lý và dịch vụ, tích hợp NFC/C06, sau đó hiệu chuẩn threshold bằng FAR/FRR và mức rủi ro đơn thuê.

---

## III. E2EE-Shield — Câu 51–75

### 51. **🔥 Đã có HTTPS, tại sao cần E2EE-Shield?**

HTTPS vẫn bắt buộc. E2EE-Shield bổ sung mã hóa payload ở tầng ứng dụng để reverse proxy/gateway chỉ thấy encrypted envelope trước điểm giải mã, đồng thời ràng buộc method, path, session, timestamp và nonce. Nó chỉ áp dụng route nhạy cảm để cân bằng bảo mật và chi phí.

### 52. **🔥 Tại sao gọi E2EE khi backend vẫn giải mã?**

Trong LensHub, hai endpoint là SDK trong browser và SDK Server Adapter; backend phải giải mã để xử lý nghiệp vụ. Nó không phải zero-knowledge hay E2EE user-to-user. Cách mô tả chính xác là application-layer endpoint-to-endpoint encryption.

### 53. E2EE-Shield bảo vệ trước mối đe dọa nào?

Nó bảo vệ tính bí mật/toàn vẹn payload khi đi qua lớp trung gian không có khóa; phát hiện sửa ciphertext/AAD và replay trong cửa sổ kiểm soát. Nó không che URL, method, kích thước, thời gian truy cập và không bảo vệ nếu browser hoặc backend đã bị chiếm quyền.

### 54. Nếu reverse proxy bị xâm nhập thì sao?

Proxy chỉ thấy envelope mã hóa và metadata nếu không có session key. Sửa path, method, AAD hoặc ciphertext sẽ bị kiểm tra và AES-GCM phát hiện. Nhưng proxy vẫn có thể chặn/DoS và quan sát traffic pattern.

### 55. Nếu trình duyệt bị XSS thì sao?

E2EE không đủ vì mã độc cùng origin có thể đọc dữ liệu trước mã hóa hoặc gọi SDK bằng khóa đang tồn tại. Chống XSS cần CSP, output encoding, kiểm soát dependency, cookie an toàn và giảm PII trên client. E2EE là một lớp, không phải toàn bộ chiến lược bảo mật.

### 56. Nếu backend bị chiếm quyền thì sao?

Backend có session key và dữ liệu sau giải mã nên attacker có thể đọc dữ liệu. E2EE-Shield không giải quyết compromised endpoint. Cần hardening, RBAC, secret management, monitoring, mã hóa at rest và phân tách quyền.

### 57. Handshake hoạt động thế nào?

Client và server sinh cặp ECDH P-256 tạm thời cùng nonce. Hai bên tạo shared secret, dùng HKDF-SHA-256 dẫn xuất AES-256 key. Server trả session ID, public key, nonce và ECDSA signature để client xác minh trước khi chấp nhận phiên.

### 58. ECDH dùng để làm gì?

ECDH cho phép hai phía tạo cùng shared secret mà không truyền trực tiếp khóa AES. Nếu chỉ chặn bắt traffic, attacker không suy ra shared secret từ hai public key. Tuy nhiên ECDH cần xác thực peer, nên LensHub dùng chữ ký server và vẫn giữ TLS.

### 59. HKDF dùng để làm gì?

Không dùng raw ECDH secret trực tiếp. HKDF kết hợp shared secret với client/server nonce và domain info `E2EE-SHIELD/v1` để tạo khóa 32 byte có mục đích rõ. Đây là key derivation và domain separation.

### 60. ECDSA trong handshake dùng để làm gì?

Server ký transcript handshake bằng identity private key. Frontend pin public key và xác minh chữ ký để hạn chế giả mạo server trong protocol. Production vẫn cần quản lý private key bằng secret manager/HSM và có kế hoạch rotation.

### 61. Nếu kẻ tấn công thay public key pin trong JavaScript thì sao?

Nếu attacker kiểm soát nguồn phân phối frontend hoặc chạy XSS đủ quyền, pin trong bundle có thể bị thay và E2EE không cứu được. Phải bảo vệ supply chain, CI/CD, CSP, integrity và hosting. Đây là lý do không được xem frontend pin là root of trust tuyệt đối.

### 62. Vì sao dùng AES-256-GCM?

AES-GCM cung cấp confidentiality và integrity/authentication trong một primitive chuẩn, được Web Crypto và Java Cryptography hỗ trợ. Nếu ciphertext, AAD hoặc authentication tag bị sửa, giải mã sẽ thất bại. Nhóm không tự phát minh thuật toán mới.

### 63. IV và nonce có giống nhau không?

IV GCM là đầu vào mật mã và không được tái sử dụng với cùng khóa. Nonce logic trong AAD dùng để nhận diện request đã xử lý và chống replay. LensHub tạo mới cả hai bằng nguồn ngẫu nhiên an toàn cho mỗi request.

### 64. Nếu reuse IV trong AES-GCM thì sao?

Reuse cặp key–IV có thể phá tính bí mật và toàn vẹn của GCM. Vì vậy mỗi message phải có IV mới, session key có TTL và cần giám sát vòng đời/message volume. Đây là điều kiện an toàn bắt buộc, không chỉ tối ưu.

### 65. AAD chứa gì và có tác dụng gì?

AAD chứa session ID, HTTP method, path, timestamp, nonce và direction. AAD không bị mã hóa nhưng được GCM xác thực, nên ciphertext không thể bị chuyển từ route này sang route khác hoặc đổi request thành response mà không bị phát hiện.

### 66. **🔥 Chống replay thế nào?**

Server kiểm timestamp trong cửa sổ ±2 phút và dùng Redis `SETNX` lưu nonce theo session với TTL 2 phút. Gửi lại cùng envelope sẽ gặp nonce đã tồn tại và bị từ chối. Redis shared store giúp cơ chế này nhất quán khi chạy nhiều instance, với điều kiện mọi node dùng cùng Redis.

### 67. Lệch đồng hồ ảnh hưởng thế nào?

Client lệch hơn hai phút có thể làm request hợp lệ bị từ chối. Timestamp chỉ thu hẹp cửa sổ; nonce mới ngăn dùng lại trong cửa sổ đó. Production cần NTP, metrics lỗi timestamp và cơ chế tái handshake/thông báo phù hợp.

### 68. Session key lưu ở đâu?

Frontend giữ `CryptoKey` trong memory, không lưu localStorage; reload sẽ handshake lại. Backend lưu AES key Base64url trong Redis với TTL 30 phút. Base64 không phải mã hóa at rest, nên Redis cần TLS, ACL, network isolation và có thể key wrapping/KMS.

### 69. Redis bị đọc thì sao?

Attacker có thể lấy session key chưa hết hạn và giải mã traffic tương ứng nếu đồng thời có ciphertext. Vì vậy Redis là tài sản nhạy cảm. Hướng production là giảm quyền, tách network, bật TLS/ACL, audit, rotation và cân nhắc mã hóa/wrapping khóa.

### 70. E2EE có bật cho toàn bộ API không?

Không. Route policy chọn các API JSON nhạy cảm; catalog công khai, multipart và callback bên thứ ba nằm ngoài. Đây là quyết định có chủ đích, nhưng route mới có thể bị bỏ sót; cần policy tests và secure-by-default cho namespace nhạy cảm.

### 71. Vì sao callback VNPay không mã hóa E2EE?

VNPay không sử dụng SDK của LensHub nên không thể tạo envelope theo protocol. Callback được bảo vệ bằng TLS, chữ ký/secure hash, kiểm số tiền, trạng thái và idempotency. E2EE không nên phá compatibility với bên thứ ba.

### 72. **🔥 Ảnh CCCD/video có được E2EE không?**

Chưa. Prototype hiện mã hóa payload JSON; multipart/binary chưa đi qua cơ chế này. File vẫn cần TLS và storage private. Hướng phát triển là mã hóa file phía client hoặc upload URL ký ngắn hạn kèm checksum và quản lý khóa.

### 73. E2EE có bảo vệ dữ liệu trong database không?

Không. Backend giải mã trước xử lý, nên dữ liệu at rest cần lớp riêng: storage/database encryption, field-level encryption, masking log, retention, backup encryption và least privilege. Không được suy từ encrypted request thành toàn bộ data lifecycle an toàn.

### 74. Các em có “tự viết crypto” không?

Nhóm không tự thiết kế primitive; dùng Web Crypto/JCA với ECDH, HKDF, AES-GCM và ECDSA. Phần nhóm xây là protocol integration, envelope, AAD, route policy và filter. Phần này vẫn cần security review/pentest độc lập trước production.

### 75. E2EE ảnh hưởng hiệu năng bao nhiêu?

Mỗi request thêm serialize/Base64, AES-GCM, Redis GET và nonce SETNX; handshake dùng bất đối xứng nhưng được tái sử dụng trong phiên. Slide có số đo thử nghiệm, nhưng nếu chưa có script tái lập, payload, concurrency và p95/p99 thì không dùng làm SLA. Kết luận an toàn: khả thi trong môi trường thử nghiệm, chưa đủ chứng minh production.

---

## IV. Kiến trúc, bảo mật, kiểm thử và vận hành — Câu 76–90

### 76. Tại sao chọn kiến trúc hiện tại thay vì microservices?

Prototype cần phát triển nhanh, transaction nghiệp vụ rõ và vận hành đơn giản nên modular monolith/Spring Boot phù hợp hơn. Các module vẫn được tách theo domain và dịch vụ ngoài qua adapter. Microservices chỉ hợp lý khi có nhu cầu scale/ownership độc lập đủ lớn.

### 77. Vai trò của NGINX là gì?

NGINX làm reverse proxy/API Gateway, định tuyến và có thể thực hiện TLS termination, rate limit hoặc header policy. Với route E2EE, NGINX chỉ chuyển encrypted envelope và không giữ session key ứng dụng.

### 78. Vì sao dùng PostgreSQL?

Nghiệp vụ có nhiều quan hệ và yêu cầu transaction: user, order, rental, device, contract, payment. PostgreSQL cung cấp ACID, constraint, indexing và locking phù hợp. NoSQL không tạo lợi ích rõ cho dữ liệu lõi này.

### 79. Vì sao dùng Redis?

Redis lưu session key và nonce có TTL, hỗ trợ thao tác `SETNX` nguyên tử cho chống replay và dùng chung giữa nhiều backend instance. Redis không thay database nghiệp vụ và cần được bảo vệ như kho bí mật ngắn hạn.

### 80. Vì sao dùng MinIO?

Ảnh sản phẩm và file eKYC là object/binary, không phù hợp lưu trực tiếp trong bảng quan hệ. MinIO cung cấp object storage tương thích S3. Production cần bucket private, URL ký ngắn hạn, encryption, retention và kiểm soát content type.

### 81. RBAC được thực hiện ở đâu?

Backend dùng role/permission trong JWT và `@PreAuthorize` tại endpoint. Kiểm tra trên UI chỉ giúp trải nghiệm, không phải biện pháp bảo mật. Quyền phải được enforce ở server cho mọi request.

### 82. Nếu đổi quyền user thì token cũ còn hiệu lực không?

Authorities đang là snapshot trong JWT nên có thể còn hiệu lực đến khi token hết hạn nếu không revoke. Hướng sửa là access token ngắn hạn, token/permission version hoặc introspection/cache invalidation khi quyền thay đổi.

### 83. Audit log có tác dụng gì?

Audit log ghi ai làm gì, lúc nào và trên đối tượng nào, hỗ trợ điều tra và truy trách nhiệm. Audit không nên chứa raw CCCD, khóa, OTP hoặc payload nhạy cảm. Log cũng cần chống sửa, retention và phân quyền xem.

### 84. Làm sao chống sửa request ngoài E2EE?

Backend không tin giá/quyền từ client, kiểm JWT/RBAC, validation, state transition, ownership và chữ ký VNPay. E2EE bảo vệ integrity của envelope nhưng không thay business validation. Request được mã hóa vẫn có thể chứa nghiệp vụ không hợp lệ do chính user gửi.

### 85. Kiểm thử 18/18 hoặc 12/12 có nghĩa gì?

Đó là số kịch bản nhóm đã chạy đạt kỳ vọng, không phải chứng minh hệ thống không còn lỗi hay đạt chuẩn pentest. Phải nêu rõ kịch bản nào tự động, môi trường, dữ liệu và expected result. Không suy từ tỷ lệ pass sang độ bao phủ 100%.

### 86. Những kiểm thử nào còn thiếu?

Concurrency cho tồn kho/slot thuê/voucher; E2E UI; callback idempotency; failure provider; benchmark AI; load test p95/p99; backup-restore; security testing độc lập; multipart/file abuse. Đây là backlog trước production.

### 87. Làm sao kiểm thử E2EE?

Unit test crypto round-trip, invalid tag, handshake signature, TTL/session và nonce. Integration test encrypted request/response, sửa AAD/ciphertext, replay, session hết hạn và route policy. Cần test nhiều instance dùng Redis chung và load test theo payload.

### 88. Làm sao đo hiệu năng đúng?

Phải cố định phần cứng, phiên bản, payload, warm-up, số lần chạy và concurrency; đo baseline không mã hóa so với có mã hóa. Báo cáo p50/p95/p99, throughput, CPU, memory, GC và Redis latency. Một con số trung bình đơn lẻ chưa đủ.

### 89. Hệ thống đã production-ready chưa?

Chưa nên khẳng định. Đây là prototype tích hợp đã chứng minh các luồng chính. Trước production phải sửa race tồn kho/thuê, payment gate, OTP/rate limit, privacy retention, eKYC claim, secret/key management, load test, backup-restore và security review.

### 90. Nếu triển khai nhiều backend instance thì sao?

Session/nonce đã dùng Redis chung nên có cơ sở scale phần E2EE. Tuy nhiên nghiệp vụ vẫn cần database locking/idempotency, object storage chung, load balancer, stateless auth, metrics và health checks. Scale ngang không tự sửa race condition database.

---

## V. Câu hỏi tổng hợp của Hội đồng — Câu 91–100

### 91. **🔥 Đóng góp chính của đề tài là gì?**

Nhóm không phát minh thuật toán AI hay mật mã mới. Đóng góp là thiết kế và kiểm chứng kiến trúc tích hợp cho bài toán thuê tài sản: eKYC thành business gate; E2EE-Shield mã hóa chọn lọc payload; quản lý tài sản theo serial, hợp đồng và audit. Giá trị nghiên cứu nằm ở mô hình đe dọa, lựa chọn cơ chế, triển khai prototype và đánh giá trong phạm vi xác định.

### 92. Đây có phải chỉ là ghép API và thư viện có sẵn?

Primitive và dịch vụ được tái sử dụng là đúng thực hành kỹ thuật. Phần nhóm giải quyết là protocol handshake, route policy, AAD, replay, adapter frontend/backend, state machine thuê, risk decision và tích hợp các failure path. Tuy nhiên nhóm không gọi đây là phát minh thuật toán mới.

### 93. Phương pháp nghiên cứu của nhóm là gì?

Nhóm phân tích bài toán và mô hình đe dọa, khảo sát giải pháp, thiết kế kiến trúc/protocol, xây dựng prototype, sau đó kiểm thử chức năng, kịch bản tấn công và hiệu năng. Cuối cùng nhóm đối chiếu kết quả với mục tiêu và xác định giới hạn/hướng phát triển.

### 94. Tại sao không chỉ dùng field-level encryption trong database?

Field-level encryption bảo vệ dữ liệu at rest nhưng không bảo vệ payload khi đi qua proxy/middleware. E2EE-Shield xử lý giai đoạn truyền ở tầng ứng dụng. Hệ thống production có thể cần cả hai vì chúng giải quyết hai giai đoạn khác nhau của vòng đời dữ liệu.

### 95. Tại sao không dùng OAuth/OpenID Connect thay eKYC?

OAuth/OIDC xác thực tài khoản tại identity provider, không mặc nhiên xác minh CCCD, quyền sở hữu khuôn mặt hoặc điều kiện thuê tài sản. Có thể dùng OIDC cho đăng nhập và eKYC cho kiểm soát danh tính/rủi ro; hai cơ chế bổ sung nhau.

### 96. Điểm yếu lớn nhất của đề tài là gì?

Khoảng cách giữa claim và bằng chứng ở một số phần: OCR chưa C06/fraud đầy đủ, multipart chưa E2EE, concurrency tồn kho/thuê chưa chặt và benchmark chưa đủ production. Việc chỉ ra đúng các giới hạn này là cơ sở cho roadmap, không nên cố che giấu.

### 97. Nếu có thêm ba tháng, ưu tiên gì?

P0 sửa correctness: atomic stock/reservation, payment gate, query trạng thái và idempotency. P1 tăng assurance: fraud/post-check, OTP rate limit, retention, policy tests và load/security test. P2 mới làm NFC/C06, file encryption, KMS/HSM và đóng gói SDK.

### 98. Làm sao chứng minh kết quả không chỉ là demo giao diện?

Trình bày evidence theo tầng: code/service và database state transition; Network cho encrypted envelope; test replay/tamper; audit log; failure case như eKYC chưa verified bị chặn thuê. Demo đẹp chỉ là minh họa, bằng chứng chính phải là hành vi kiểm tra được.

### 99. Phân công hai thành viên thế nào?

Trả lời đúng nhật ký thực tế: ai phụ trách frontend/UX, ai backend/security/AI, phần nào cùng thiết kế và kiểm thử. Không chia 50/50 chung chung. Mỗi người phải hiểu luồng tổng thể và có thể giải thích phần của người còn lại ở mức kiến trúc.

### 100. Câu kết luận một phút của đề tài là gì?

LensHub chứng minh khả năng kết hợp nghiệp vụ bán–thuê, AI-assisted eKYC và mã hóa payload tầng ứng dụng trong một prototype vận hành được. eKYC giúp giảm công việc và sàng lọc rủi ro nhưng chưa thay C06/manual review; E2EE-Shield tăng bảo vệ qua lớp trung gian nhưng không thay TLS, endpoint security hay encryption at rest. Kết quả khả thi trong phạm vi thử nghiệm; roadmap production đã được xác định rõ.

---

---

## VI. Câu truy tiếp, lỗi demo, nghiên cứu và production — Câu 101–160

### 101. Câu hỏi nghiên cứu cụ thể của đề tài là gì?

Đề tài trả lời câu hỏi: có thể thiết kế và tích hợp một lớp mã hóa payload tầng ứng dụng cùng AI-assisted eKYC vào nền tảng bán–thuê thiết bị mà vẫn duy trì được luồng nghiệp vụ và hiệu năng khả thi trong môi trường thử nghiệm hay không. Các nhóm kết quả tương ứng là chức năng, kiểm soát bảo mật và overhead đo được.

### 102. Tiêu chí nào quyết định đề tài đạt mục tiêu?

Mỗi mục tiêu phải có bằng chứng: nghiệp vụ chính chạy đúng state; người chưa eKYC bị chặn thuê; route nhạy cảm truyền envelope thay plaintext; sửa tag/AAD và replay bị từ chối; overhead được đo bằng quy trình tái lập. Đạt mục tiêu prototype không đồng nghĩa đạt SLA production.

### 103. Nếu bỏ E2EE-Shield, đề tài còn gì?

Vẫn còn nền tảng bán–thuê, eKYC, hợp đồng và quản lý tài sản. Tuy nhiên E2EE-Shield là phần nghiên cứu kỹ thuật nổi bật giúp đề tài vượt khỏi một website CRUD thông thường. Nhóm cần phân biệt phần sản phẩm với phần đóng góp nghiên cứu.

### 104. Hai mức route `SENSITIVE` và `CRITICAL` khác nhau thế nào?

Nếu hiện tại hai mức đều dùng cùng một cơ chế mã hóa thì khác biệt chủ yếu là phân loại chính sách, chưa tạo hành vi mật mã khác nhau. Muốn có giá trị rõ hơn, `CRITICAL` có thể yêu cầu session mới, re-authentication, timeout ngắn hoặc audit bắt buộc. Nhóm không nên mô tả khác biệt chưa được code thực thi.

### 105. Demo nào chứng minh giá trị nghiên cứu tốt nhất?

Demo mạnh nhất là cho xem plaintext ở UI nhưng encrypted envelope trong Network, sau đó replay cùng request và chứng minh server từ chối. Tiếp theo cho thấy tài khoản chưa `VERIFIED` không thể thuê. Hai demo này chứng minh cơ chế nghiên cứu, tốt hơn chỉ demo checkout thành công.

### 106. Nếu FPT.AI lỗi lúc demo thì làm sao?

Không giả vờ rằng provider vẫn hoạt động. Nhóm chuẩn bị video/log dự phòng đã ẩn PII, đồng thời giải thích hệ thống fail closed và không auto-approve. Phân biệt rõ lỗi dependency với kết quả eKYC thất bại.

### 107. Nếu handshake thất bại, hệ thống có hạ xuống plaintext không?

Với route bắt buộc E2EE, hành vi an toàn phải là fail closed, báo lỗi hoặc tái handshake; không tự downgrade sang plaintext. Nếu tự fallback thì attacker có thể chủ động phá handshake để tạo downgrade attack. Catalog/public route vẫn hoạt động theo policy riêng.

### 108. Nhóm có baseline không dùng E2EE để so sánh không?

Baseline cần cùng endpoint, payload, phần cứng và concurrency nhưng tắt lớp E2EE. So sánh latency, throughput, CPU, memory và Redis calls. Nếu chưa có artifact đầy đủ, chỉ gọi số hiện tại là feasibility measurement.

### 109. Thử nghiệm nào làm nhóm thay đổi thiết kế?

Trả lời theo lịch sử thật. Ví dụ replay test dẫn đến bổ sung nonce store, hoặc yêu cầu scale khiến session/nonce chuyển sang Redis. Nếu không có thay đổi thực nghiệm rõ, không bịa; nói thiết kế được điều chỉnh sau review threat model và kiểm thử nào.

### 110. Người khác có tái lập benchmark bằng gì?

Cần script, commit/version, cấu hình máy, payload, số lần chạy, warm-up, concurrency và raw result. Chỉ ảnh biểu đồ hoặc con số trên slide chưa đủ reproducibility. Nếu thiếu, nhóm phải thừa nhận và đưa vào hướng hoàn thiện.

### 111. Trách nhiệm LensHub và FPT.AI được phân định thế nào?

FPT cung cấp tín hiệu theo contract; LensHub quyết định policy, trạng thái thuê, manual review, lưu trữ và thông báo người dùng. LensHub không được đổ quyết định nghiệp vụ hoàn toàn cho provider. Cần lưu provider/model version, raw warning và người duyệt.

### 112. Chỉ số nào chứng minh eKYC cải thiện nghiệp vụ?

Nên đo thời gian xử lý một hồ sơ, tỷ lệ OCR phải nhập lại, tỷ lệ chuyển manual review, tỷ lệ retry và thời gian duyệt. Prototype hiện chủ yếu chứng minh tích hợp, chưa có dữ liệu vận hành để khẳng định giảm bao nhiêu phần trăm chi phí.

### 113. Xoay khóa định danh backend thế nào?

Production nên hỗ trợ key ID và giai đoạn chồng lấp nhiều public key. Frontend mới pin khóa mới, phiên cũ hết TTL hoặc bị revoke có kiểm soát. Private key cần nằm trong secret manager/HSM và có audit/rollback plan.

### 114. Làm sao chứng minh dữ liệu eKYC đã được xóa?

Cần job retention có log kết quả, inventory object/database, xác nhận xóa từ provider và kiểm tra bản sao/backup theo chính sách. Chỉ xóa record database không chứng minh ảnh trong MinIO, raw response và backup đã được xử lý.

### 115. Kết quả nào dễ bị hiểu nhầm thành production result?

Độ trễ trên slide, tỷ lệ test pass, OCR/face/liveness pass và câu “mã hóa đầu cuối” đều dễ bị hiểu quá mức. Khi nói, phải thêm phạm vi: môi trường thử nghiệm, tập kịch bản đã chạy, AI-assisted và application-layer browser–backend.

### 116. Nếu Redis chết thì chức năng nào hỏng?

E2EE handshake/session lookup, replay nonce và các chức năng khác phụ thuộc Redis có thể lỗi. Redis ở đây không chỉ là cache có thể bỏ qua. Production cần Redis HA, persistence phù hợp, timeout, monitoring và readiness để node không nhận traffic khi dependency quan trọng chưa sẵn sàng.

### 117. Session E2EE hết hạn đúng lúc submit thì sao?

Client có thể xóa session, handshake lại và retry một lần. Tuy nhiên mutation như checkout cần idempotency key, vì trường hợp server đã commit nhưng response bị mất có thể khiến retry tạo bản ghi trùng. Recovery transport và idempotency nghiệp vụ là hai vấn đề khác nhau.

### 118. Mail lỗi sau checkout thì đơn có mất không?

DB transaction và email là hai hệ thống không có atomic transaction chung. Có thể đơn đã commit nhưng email lỗi hoặc email đã gửi trước khi DB rollback. Giải pháp production là transactional outbox và worker retry, không phụ thuộc gửi mail đồng bộ trong transaction.

### 119. MinIO lỗi khi nhân viên duyệt eKYC thì sao?

Metadata có thể vẫn còn trong DB nhưng nhân viên không xem được ảnh/video. Không nên cho approve khi evidence không truy cập được. Hệ thống cần trạng thái dependency failure, retry, checksum và hard gate duyệt.

### 120. Một item hết kho giữa checkout nhiều item có tạo partial order không?

Trong một transaction, validation và cập nhật DB lỗi sẽ rollback toàn bộ, nên không nên có partial DB order. Tuy nhiên cạnh tranh giữa nhiều transaction vẫn còn race. Tính nguyên tử nội bộ khác với isolation đồng thời.

### 121. VNPay gọi return URL và IPN gần như đồng thời thì sao?

Xử lý phải khóa đơn hoặc dùng idempotency/unique transaction reference. Callback thứ hai thấy trạng thái đã thành công và không được ghi nhận thanh toán lần hai. Cần integration test cả hai đường gọi và thứ tự đảo ngược.

### 122. Callback thất bại đến sau callback thành công có ghi đè không?

Không được ghi đè `SUCCESS` thành `FAILED`. Code hiện có nhánh kiểm trạng thái thành công trước khi cập nhật tiếp, nhưng vẫn cần test out-of-order. Trạng thái thanh toán phải tiến một chiều theo invariant xác định.

### 123. Kẻ gian sửa số tiền hoặc order code trong callback thì sao?

Sửa tham số làm secure hash không hợp lệ. Backend còn phải so số tiền, transaction reference và order tương ứng. Không được tin dữ liệu redirect frontend hoặc chỉ dựa vào response code.

### 124. Người dùng double-click “đã nhận hàng” thì sao?

Lần đầu chuyển `DELIVERED → COMPLETED`; lần sau state không còn hợp lệ nên bị từ chối. UX tốt hơn là endpoint idempotent hoặc disable/debounce nút. Không được tạo hai lần hoàn tất hay hoàn kho.

### 125. Staff gọi API trực tiếp để bỏ qua nút UI thì sao?

Backend state machine và `@PreAuthorize` phải là nguồn sự thật. Nếu chỉ ẩn nút ở frontend thì không bảo mật. Request nhảy trạng thái phải bị backend từ chối dù gửi bằng Postman.

### 126. Audit kho có giải thích mọi lần tồn kho thay đổi không?

Chưa đầy đủ nếu checkout sửa trực tiếp `Product.quantity` nhưng inventory ledger chỉ ghi thao tác điều chỉnh tay. Hướng sửa là mọi stock mutation đi qua một inventory service/ledger, có old/new quantity, reference type và order ID.

### 127. Audit log có bất biến không?

Audit hiện là log ứng dụng; chưa có bằng chứng append-only, WORM, hash chain hoặc SIEM bên ngoài. Vì vậy không gọi là bất biến. Production có thể dùng DB role chỉ insert, immutable retention, ký/hash batch và export sang hệ thống độc lập.

### 128. Có biết chính xác admin nào duyệt eKYC không?

Luồng hiện cần hoàn thiện việc persist reviewer ID, action, thời gian, risk snapshot và lý do override. Nếu chỉ lưu note/trạng thái thì audit trách nhiệm chưa đủ. Đơn rủi ro cao nên yêu cầu four-eyes.

### 129. Sequence diagram nói OrderService gọi InventoryService nhưng code thì sao?

Code hiện có chỗ OrderService truy cập ProductRepository trực tiếp. Diagram vì vậy mô tả logical responsibility, không hoàn toàn là call graph. Cần nói code là source of truth và cập nhật diagram hoặc refactor qua InventoryService.

### 130. Thứ tự ký hợp đồng và thanh toán trên diagram có đúng code không?

Code thực tế tạo đơn `PENDING_PAYMENT`, thanh toán phí thuê, staff chuẩn bị và sinh hợp đồng nháp, sau đó khách nhận OTP/ký. Nếu diagram cũ vẽ ký trước thanh toán thì phải thừa nhận mismatch và dùng luồng code hiện tại khi trả lời.

### 131. Vì sao production có thể fail startup dù local chạy được?

Local có thể dùng Hibernate update, còn production dùng Flyway và validate schema. Nếu migration không đầy đủ, database sạch hoặc schema lệch sẽ fail. Cần version hóa migration, test clean-database deployment và không dựa vào auto-update ở production.

### 132. Docker Compose đã bảo đảm dependency ready chưa?

`depends_on` chỉ bảo đảm thứ tự khởi động nếu không gắn health condition; không chứng minh DB/Redis/MinIO đã sẵn sàng. Cần healthcheck, readiness, retry/backoff và smoke test sau deploy.

### 133. Người thật, video thật nhưng text CCCD sửa: bước nào chặn chắc chắn?

Trong integration hiện tại không có bước tự động chặn chắc chắn. Face/liveness có thể pass đúng chức năng; OCR đọc phần đã sửa. Manual review là hard gate hiện tại; fraud/QR/NFC/C06 là các lớp cần bổ sung.

### 134. Face score cao có thể làm reviewer tin nhầm không?

Có. Face score cao chỉ củng cố quan hệ giữa selfie và ảnh chân dung, không củng cố số CCCD. UI phải tách biometric evidence với document/data evidence và hiển thị `NOT_CHECKED` thay vì một nhãn xanh tổng hợp.

### 135. Tăng threshold face match lên 95 có giải quyết CCCD sửa không?

Không. Nó chỉ giảm nhầm khuôn mặt, không phát hiện phần chữ bị sửa khi ảnh vẫn đúng người; đồng thời tăng false reject. Phải dùng đúng lớp kiểm soát: fraud/QR/NFC/C06 và review.

### 136. Threshold có nên thay đổi theo giá trị thiết bị?

Có thể dùng risk-tier policy: đơn giá trị cao yêu cầu review rộng hơn hoặc NFC/C06. Nhưng không được tùy ý đổi similarity threshold nếu chưa có FAR/FRR và calibration. Policy phải version hóa và audit được.

### 137. Dataset nào đủ để chọn threshold?

Cần tập genuine/impostor có consent, đại diện camera, ánh sáng, tuổi và điều kiện sử dụng; tách calibration/test. Báo ROC/DET, FAR tại FRR, confidence interval và kết quả theo nhóm/thiết bị. Vài mẫu demo không đủ.

### 138. Nếu không có đủ mẫu gian lận thì đánh giá thế nào?

Có thể làm controlled red-team có consent theo taxonomy: look-alike, ảnh in, replay, edited text, recaptured screen và deepfake. Phải báo rõ kích thước mẫu và giới hạn. Trước khi đủ bằng chứng, giữ manual hard gate.

### 139. Consent eKYC có cho phép dùng video để huấn luyện AI không?

Không mặc nhiên. Xác minh danh tính và tái sử dụng sinh trắc học để training là hai mục đích khác nhau. Training cần căn cứ pháp lý/consent riêng, mục đích, thời hạn, quyền rút lại và cơ chế loại dữ liệu.

### 140. Người dùng rút consent sau khi đã KYC thì sao?

Không thể nói xóa tất cả ngay nếu còn hợp đồng/legal hold, cũng không được giữ vô hạn. Phải phân loại ảnh/video, raw response, score, audit và hợp đồng theo mục đích; xóa hoặc hạn chế phần không còn căn cứ, giữ tối thiểu phần bắt buộc.

### 141. Retention của FPT và LensHub khác nhau thì ai chịu trách nhiệm?

LensHub vẫn là bên quyết định gửi dữ liệu và sử dụng kết quả, nên phải biết provider lưu gì, bao lâu và xóa thế nào. Cần DPA/hợp đồng, quy trình xóa và quản lý bản sao LensHub. Không thể chuyển toàn bộ trách nhiệm cho FPT.

### 142. Video “thật” có thể đồng thời là deepfake không?

Có. Luồng có chuyển động thật vẫn có thể bị face-swap hoặc injection; replay, presentation attack và deepfake là các lớp khác nhau. Cần đọc riêng liveness, spoof, deepfake và warning.

### 143. `is_live=true` nhưng `need_to_review=true` thì sao?

Không coi là pass sạch. Policy an toàn là `REVIEW_REQUIRED`. LensHub hiện chưa tiêu thụ đầy đủ field này nên phải nêu là integration gap trước khi tự động hóa.

### 144. Nhân viên duyệt nhầm thì trách nhiệm thuộc AI hay người duyệt?

LensHub là bên ra quyết định nghiệp vụ; FPT cung cấp tín hiệu, reviewer thực thi policy. Cần audit model/provider version, cảnh báo đã hiển thị, checklist, người duyệt và lý do override. AI không phải chủ thể để đẩy toàn bộ trách nhiệm.

### 145. Làm sao tránh automation bias của reviewer?

Không hiển thị một điểm tổng màu xanh che mất nguồn bằng chứng. Tách OCR, face, liveness, fraud, NFC/C06 và `NOT_CHECKED`; bắt xem cảnh báo trọng yếu và nhập lý do override. Định kỳ audit mẫu đã duyệt.

### 146. FPT đổi model nhưng giữ API thì sao?

Score distribution và FAR/FRR có thể thay đổi dù schema giữ nguyên. LensHub cần lưu version nếu có, giám sát pass rate/score drift, canary/regression và hiệu chuẩn lại threshold. Không giả định ngưỡng cũ đúng mãi.

### 147. Có endpoint C06 nghĩa là LensHub đương nhiên được gọi không?

Không. Tài liệu công khai không chứng minh API key có entitlement hoặc pháp nhân đủ điều kiện. Chỉ coi verified khi integration được cấp quyền và response trả đúng kết quả authoritative; timeout, `N/A` hoặc chưa gọi là `NOT_VERIFIED`.

### 148. Sinh đôi hoặc người rất giống nhau thì face match xử lý sao?

Đây là trường hợp làm tăng nguy cơ false accept. Không dựa vào face match đơn lẻ; kết hợp liveness, document evidence, NFC/C06 và manual review cho mức rủi ro cao. Threshold phải được đánh giá trên look-alike data nếu muốn claim.

### 149. Ảnh CCCD quá cũ so với khuôn mặt hiện tại thì sao?

Có thể làm tăng false reject do tuổi, tóc, cân nặng hoặc chất lượng ảnh. Hệ thống nên cho retry có hướng dẫn, không tự gắn gian lận, và chuyển review. Đây là lý do cần vùng bất định thay vì pass/fail tuyệt đối.

### 150. CCCD hết hạn nhưng face/liveness pass thì sao?

Hồ sơ vẫn không đủ điều kiện theo policy tài liệu vì sinh trắc học không làm giấy tờ hết hạn trở lại hợp lệ. Hệ thống phải tách document validity theo ngày với biometric result và yêu cầu giấy tờ còn hiệu lực.

### 151. Một người tạo nhiều tài khoản dùng cùng CCCD thì sao?

LensHub có duplicate check nội bộ và nên chặn hoặc chuyển review. Tuy nhiên đây chỉ là kiểm tra trong LensHub, không phải C06. Cần quy tắc merge/appeal vì người dùng có thể mất tài khoản cũ hợp pháp.

### 152. Người chưa đủ tuổi thuê thiết bị thì sao?

OCR có thể trích ngày sinh, backend tính tuổi và policy phải chặn hoặc yêu cầu người đại diện theo quy định. Nếu hệ thống chưa có age gate rõ, phải thừa nhận là yêu cầu nghiệp vụ/pháp lý chưa hoàn thiện.

### 153. Deepfake injection khác ảnh chiếu trước camera thế nào?

Ảnh/màn hình/mặt nạ là presentation attack tại cảm biến; injection đưa video giả trực tiếp vào pipeline; deepfake biến đổi hoặc sinh khuôn mặt. Mỗi loại cần tín hiệu khác nhau, nên một boolean liveness không đủ bao phủ tất cả.

### 154. Xóa dữ liệu khỏi database nhưng backup còn thì sao?

Chính sách xóa phải nói rõ backup retention và thời điểm dữ liệu biến mất theo chu kỳ backup. Backup cần mã hóa, quyền hạn chế và không được phục hồi dữ liệu đã xóa vào production ngoài quy trình kiểm soát.

### 155. Hệ thống có tuân thủ pháp luật dữ liệu cá nhân chưa?

Không nên tự tuyên bố compliance nếu chưa có legal review, DPIA/records, consent, retention và bằng chứng vận hành. Nhóm có thể nói kiến trúc hướng đến data minimization, access control và audit, còn đánh giá tuân thủ production là công việc tiếp theo.

### 156. Nếu lộ dữ liệu CCCD thì xử lý thế nào?

Cô lập nguồn, revoke credential/key, bảo toàn log, đánh giá phạm vi, thông báo theo nghĩa vụ pháp lý/hợp đồng và hỗ trợ người bị ảnh hưởng. Sau đó phân tích root cause và sửa. Cần incident response plan; mã hóa không thay quy trình ứng phó.

### 157. Làm sao quản lý lỗ hổng dependency?

Khóa phiên bản, chạy SCA/dependency scanning, theo dõi CVE, cập nhật có kiểm thử và tạo SBOM. Frontend supply chain đặc biệt quan trọng vì XSS/dependency độc hại có thể đọc dữ liệu trước E2EE.

### 158. Handshake hoặc payload lớn có bị dùng để DoS không?

Có. ECDH, Base64, buffer request/response và Redis calls tiêu tốn CPU/memory. Cần rate limit handshake, giới hạn body, timeout, authentication phù hợp, circuit breaker và quan sát CPU/GC.

### 159. E2EE có thay JWT, CSRF và RBAC không?

Không. E2EE bảo vệ nội dung/độ toàn vẹn transport tầng ứng dụng; JWT xác thực phiên, RBAC cấp quyền, CSRF bảo vệ request dựa credential tự gửi. Một encrypted request vẫn có thể do user không đủ quyền gửi nên backend phải kiểm tất cả lớp.

### 160. Nếu Hội đồng yêu cầu kết luận đề tài trong 30 giây?

LensHub là prototype tích hợp bán–thuê, AI-assisted eKYC và mã hóa payload browser–backend. Nhóm chứng minh được luồng chính, chống sửa/replay theo thiết kế và tính khả thi ban đầu; đồng thời xác định rõ giới hạn về C06, file multipart, concurrency, benchmark và production hardening.

---

## Xếp hạng xác suất: 30 câu nên học trước

### Mức A — Gần như chắc chắn hoặc thầy đã hỏi

91, 5, 8, 11, 51, 52, 28, 93, 92, 96.

### Mức B — Xác suất cao

75, 85, 89, 72, 30, 42, 66, 57, 74, 53, 98, 15, 20, 45, 48.

### Mức C — Dễ bị hỏi truy tiếp

22, 76, 70, 73, 97.

## 15 câu phải học trước nếu thiếu thời gian

91, 5, 8, 11, 51, 52, 28, 93, 92, 96, 75, 72, 30, 66, 57.

## Các câu tuyệt đối tránh nói

- “OCR của FPT xác minh trực tiếp với C06.”
- “Face match + liveness pass nghĩa là CCCD thật.”
- “Serial chứng minh hàng chính hãng.”
- “Có transaction nên không thể oversell.”
- “OTP của nhóm là chữ ký số.”
- “Tất cả dữ liệu, kể cả file, đều được E2EE.”
- “E2EE bảo vệ ngay cả khi browser/backend bị chiếm quyền.”
- “18/18 test nghĩa là hệ thống an toàn 100%.”
- “Độ trễ thấp nên đã sẵn sàng production.”

## Câu nói cứu nguy khi chưa có bằng chứng

> Trong phạm vi hiện tại, nhóm chưa có đủ dữ liệu để khẳng định điều đó. Bằng chứng nhóm đang có là … Giới hạn là … Nếu triển khai thực tế, nhóm sẽ bổ sung …

## Câu hỏi còn cần nhóm tự điền

1. Phân công thực tế giữa Trương Ái Nga và Nguyễn Thành Lộc.
2. Số liệu benchmark có script/raw result tái lập được hay chỉ là số tổng hợp trên slide.
3. Chính sách retention cụ thể cho CCCD, selfie, video và raw response.
4. Môi trường demo ngày bảo vệ có bật `APP_E2EE_ENABLED` và dùng đúng public key không.
5. API key/gói FPT thực tế có entitlement fraud, NFC hoặc C06 nào.
