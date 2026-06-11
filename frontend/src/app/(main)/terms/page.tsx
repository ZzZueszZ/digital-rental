import { ScrollText } from "lucide-react";

import {
  PolicyPageShell,
  type PolicySection,
} from "@/components/legal/PolicyPageShell";

const sections: PolicySection[] = [
  {
    id: "chap-thuan",
    title: "Chấp thuận điều khoản",
    paragraphs: [
      "Khi đăng ký tài khoản hoặc sử dụng chức năng mua, thuê trên Digital Rental, người dùng xác nhận đã đọc và đồng ý với các điều kiện áp dụng cho giao dịch.",
      "Nếu không đồng ý, người dùng nên dừng thao tác trước khi xác nhận đơn hoặc ký hợp đồng.",
    ],
  },
  {
    id: "tai-khoan",
    title: "Tài khoản người dùng",
    items: [
      "Người dùng cung cấp thông tin chính xác và chịu trách nhiệm bảo mật thông tin đăng nhập.",
      "Không sử dụng tài khoản, giấy tờ hoặc thông tin định danh của người khác.",
      "Hệ thống có thể khóa tài khoản khi phát hiện đăng nhập thất bại nhiều lần hoặc dấu hiệu vi phạm.",
      "Vai trò và quyền truy cập được giới hạn theo chức năng được cấp.",
    ],
  },
  {
    id: "mua-hang",
    title: "Giao dịch mua hàng",
    items: [
      "Đơn chỉ được xác nhận khi sản phẩm còn hàng và thông tin nhận hàng hợp lệ.",
      "Giá, voucher, phí giao hàng và tổng thanh toán được xác định tại thời điểm tạo đơn.",
      "Kết quả thanh toán trực tuyến chỉ được ghi nhận khi phản hồi VNPay được xác minh hợp lệ.",
      "Khách hàng cần kiểm tra và xác nhận đã nhận sản phẩm trên hệ thống.",
    ],
  },
  {
    id: "thue-thiet-bi",
    title: "Giao dịch thuê thiết bị",
    items: [
      "Khách hàng phải đăng nhập và có eKYC VERIFIED trước khi tạo đơn thuê.",
      "Thiết bị chỉ được xác nhận khi còn khả dụng trong toàn bộ thời gian đăng ký.",
      "Phí thuê phải được thanh toán trước khi nhân viên chuẩn bị thiết bị.",
      "Hợp đồng, tiền cọc và biên bản bàn giao phải hoàn tất trước khi nhận thiết bị.",
      "Khách hàng chịu trách nhiệm bảo quản và hoàn trả đúng thời hạn, tình trạng và phụ kiện.",
    ],
  },
  {
    id: "thanh-toan",
    title: "Thanh toán, tiền cọc và phát sinh",
    paragraphs: [
      "Thanh toán trực tuyến được thực hiện qua VNPay. Tiền cọc thiết bị có thể được thu theo phương thức và số tiền ghi trong hồ sơ thuê.",
      "Khi hoàn trả, các khoản trễ hạn, hư hỏng hoặc thiếu phụ kiện được tính trước khi xác định số tiền hoàn cọc hoặc khoản cần thanh toán thêm.",
    ],
  },
  {
    id: "han-che",
    title: "Hành vi không được phép",
    items: [
      "Giả mạo danh tính, can thiệp kết quả eKYC hoặc sử dụng giấy tờ không chính chủ.",
      "Tấn công, khai thác lỗi, phát lại request hoặc cố gắng vượt qua cơ chế phân quyền.",
      "Sửa serial, tháo lắp hoặc chuyển giao thiết bị thuê trái thỏa thuận.",
      "Sử dụng nội dung, hình ảnh hoặc dữ liệu hệ thống cho mục đích trái pháp luật.",
    ],
  },
  {
    id: "thay-doi",
    title: "Thay đổi điều khoản",
    paragraphs: [
      "Điều khoản có thể được cập nhật khi nghiệp vụ, công nghệ hoặc quy định liên quan thay đổi. Phiên bản mới sẽ hiển thị ngày cập nhật trên trang này.",
    ],
    note:
      "Điều khoản trên trang cung cấp nguyên tắc chung; hợp đồng thuê cụ thể là căn cứ trực tiếp cho từng giao dịch thuê.",
  },
];

export default function TermsPage() {
  return (
    <PolicyPageShell
      icon={ScrollText}
      eyebrow="Điều kiện sử dụng"
      title="Điều khoản dịch vụ"
      summary="Quy định quyền, trách nhiệm và điều kiện áp dụng khi người dùng truy cập, mua hàng hoặc thuê thiết bị trên Digital Rental."
      updatedAt="2026-06-11"
      sections={sections}
      relatedHref="/rental-process"
      relatedLabel="Xem quy trình thuê"
    />
  );
}
