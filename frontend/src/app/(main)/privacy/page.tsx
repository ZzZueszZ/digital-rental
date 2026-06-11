import { ShieldCheck } from "lucide-react";

import {
  PolicyPageShell,
  type PolicySection,
} from "@/components/legal/PolicyPageShell";

const sections: PolicySection[] = [
  {
    id: "du-lieu-thu-thap",
    title: "Dữ liệu được thu thập",
    items: [
      "Thông tin tài khoản: email, số điện thoại, mật khẩu đã được băm và trạng thái tài khoản.",
      "Thông tin hồ sơ, địa chỉ giao nhận, đơn mua, đơn thuê và lịch sử thanh toán.",
      "Dữ liệu eKYC: thông tin giấy tờ, ảnh giấy tờ, selfie, video liveness và kết quả xác minh.",
      "Dữ liệu kỹ thuật: địa chỉ IP, user-agent, nhật ký thao tác và thông tin cần thiết để bảo vệ phiên làm việc.",
    ],
  },
  {
    id: "muc-dich",
    title: "Mục đích xử lý",
    items: [
      "Tạo và quản lý tài khoản người dùng.",
      "Xử lý giao dịch mua, thuê, thanh toán, giao nhận và hỗ trợ khách hàng.",
      "Xác minh người thuê, đánh giá rủi ro và hạn chế gian lận tài sản.",
      "Kiểm tra bảo mật, phân quyền, điều tra lỗi và cải thiện chất lượng dịch vụ.",
    ],
  },
  {
    id: "bao-ve",
    title: "Biện pháp bảo vệ",
    paragraphs: [
      "Hệ thống sử dụng JWT, BCrypt và mô hình Role–Permission để xác thực và kiểm soát quyền truy cập.",
      "E2EE-Shield được áp dụng cho payload JSON thuộc nhóm API nhạy cảm. Cơ chế này sử dụng AES-GCM, AAD, timestamp và nonce; không thay thế HTTPS hoặc bảo vệ dữ liệu khi lưu trữ.",
    ],
    items: [
      "Giới hạn chức năng quản trị theo permission.",
      "Ghi nhận audit log cho các thao tác quan trọng.",
      "Kiểm tra kích thước, định dạng và đường dẫn tệp tải lên.",
      "Không chủ động ghi khóa phiên hoặc nội dung plaintext nhạy cảm vào log ứng dụng.",
    ],
  },
  {
    id: "chia-se",
    title: "Dịch vụ bên thứ ba",
    paragraphs: [
      "Dữ liệu chỉ được gửi đến dịch vụ bên ngoài khi cần thiết để thực hiện chức năng tương ứng, như VNPay cho thanh toán, nhà cung cấp AI cho eKYC và SMTP cho email.",
      "Mỗi dịch vụ chỉ nhận nhóm dữ liệu cần thiết cho tác vụ được yêu cầu.",
    ],
  },
  {
    id: "quyen-nguoi-dung",
    title: "Quyền và lựa chọn của người dùng",
    items: [
      "Xem và cập nhật thông tin hồ sơ, địa chỉ trong phạm vi hệ thống cho phép.",
      "Đổi mật khẩu, email và đăng xuất khỏi phiên làm việc.",
      "Liên hệ hỗ trợ khi cần kiểm tra, sửa thông tin hoặc phản ánh việc sử dụng dữ liệu.",
      "Không cung cấp dữ liệu eKYC nếu không có nhu cầu sử dụng chức năng thuê thiết bị.",
    ],
  },
  {
    id: "gioi-han",
    title: "Giới hạn hiện tại",
    paragraphs: [
      "E2EE-Shield hiện bảo vệ request và response JSON thuộc route policy. Tệp multipart như ảnh hoặc video eKYC chưa được mã hóa trực tiếp bằng encrypted envelope của SDK.",
      "Dữ liệu vẫn cần được bảo vệ bổ sung tại cơ sở dữ liệu, hệ thống tệp, hạ tầng triển khai và quy trình vận hành.",
    ],
    note:
      "Digital Rental không mô tả E2EE như cơ chế thay thế toàn bộ các lớp bảo mật khác.",
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPageShell
      icon={ShieldCheck}
      eyebrow="Quyền riêng tư"
      title="Chính sách bảo mật"
      summary="Giải thích loại dữ liệu Digital Rental xử lý, mục đích sử dụng và các cơ chế đang được áp dụng để giảm nguy cơ truy cập trái phép."
      updatedAt="2026-06-11"
      sections={sections}
      relatedHref="/trust"
      relatedLabel="Xem trung tâm an toàn"
    />
  );
}
