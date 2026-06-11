import { Cookie } from "lucide-react";

import {
  PolicyPageShell,
  type PolicySection,
} from "@/components/legal/PolicyPageShell";

const sections: PolicySection[] = [
  {
    id: "cookie-la-gi",
    title: "Cookie là gì?",
    paragraphs: [
      "Cookie là dữ liệu nhỏ được trình duyệt lưu để duy trì phiên, ghi nhớ một số lựa chọn và hỗ trợ chức năng của website.",
      "Digital Rental ưu tiên sử dụng cookie cần thiết cho xác thực và vận hành thay vì theo dõi quảng cáo.",
    ],
  },
  {
    id: "cookie-su-dung",
    title: "Cookie và dữ liệu phiên đang sử dụng",
    items: [
      "Refresh token được lưu thông qua cookie để hỗ trợ cấp lại access token khi phiên còn hợp lệ.",
      "Access token được giữ trong bộ nhớ Frontend thay vì lưu lâu dài trong local storage.",
      "Trạng thái giao diện hoặc chủ đề có thể được lưu cục bộ để duy trì lựa chọn của người dùng.",
      "Khóa phiên E2EE được giữ trong bộ nhớ và không được lưu bằng cookie.",
    ],
  },
  {
    id: "muc-dich",
    title: "Mục đích sử dụng",
    items: [
      "Duy trì trạng thái đăng nhập và làm mới phiên an toàn.",
      "Bảo vệ luồng xác thực khỏi việc lặp lại thao tác không cần thiết.",
      "Ghi nhớ lựa chọn giao diện phù hợp.",
      "Hỗ trợ phát hiện lỗi và bảo đảm các chức năng hoạt động ổn định.",
    ],
  },
  {
    id: "quan-ly",
    title: "Quản lý cookie",
    paragraphs: [
      "Người dùng có thể xóa hoặc chặn cookie trong phần cài đặt trình duyệt. Khi cookie xác thực bị xóa, hệ thống có thể yêu cầu đăng nhập lại.",
      "Việc chặn toàn bộ cookie có thể khiến một số chức năng tài khoản, thanh toán hoặc bảo vệ phiên không hoạt động đúng.",
    ],
  },
  {
    id: "ben-thu-ba",
    title: "Dịch vụ bên thứ ba",
    paragraphs: [
      "Khi chuyển sang cổng thanh toán hoặc dịch vụ bên ngoài, cookie của dịch vụ đó được điều chỉnh bởi chính sách riêng của nhà cung cấp.",
      "Digital Rental không kiểm soát cookie được tạo trực tiếp trên tên miền của bên thứ ba.",
    ],
  },
  {
    id: "thay-doi",
    title: "Cập nhật chính sách",
    paragraphs: [
      "Chính sách cookie được cập nhật khi cách quản lý phiên hoặc công nghệ Frontend thay đổi. Ngày cập nhật gần nhất được hiển thị ở đầu trang.",
    ],
    note:
      "Website hiện chưa triển khai hệ thống cookie quảng cáo hoặc hồ sơ theo dõi hành vi đa nền tảng.",
  },
];

export default function CookiesPage() {
  return (
    <PolicyPageShell
      icon={Cookie}
      eyebrow="Dữ liệu trình duyệt"
      title="Chính sách cookie"
      summary="Giải thích cách website sử dụng cookie và dữ liệu phiên để duy trì đăng nhập, bảo vệ tài khoản và vận hành chức năng."
      updatedAt="2026-06-11"
      sections={sections}
      relatedHref="/privacy"
      relatedLabel="Xem chính sách bảo mật"
    />
  );
}
