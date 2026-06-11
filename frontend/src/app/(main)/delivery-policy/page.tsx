import { Truck } from "lucide-react";

import {
  PolicyPageShell,
  type PolicySection,
} from "@/components/legal/PolicyPageShell";

const sections: PolicySection[] = [
  {
    id: "pham-vi",
    title: "Phạm vi áp dụng",
    paragraphs: [
      "Chính sách này áp dụng cho đơn mua sản phẩm và việc nhận, trả thiết bị thuê trên nền tảng Digital Rental.",
      "Hình thức thực hiện phụ thuộc loại giao dịch, địa chỉ khách hàng, tình trạng thiết bị và thông tin được hiển thị khi xác nhận đơn.",
    ],
  },
  {
    id: "don-mua",
    title: "Giao nhận đối với đơn mua",
    items: [
      "Khách hàng cung cấp tên người nhận, số điện thoại và địa chỉ giao hàng hợp lệ.",
      "Phí giao hàng và ưu đãi giao hàng được hiển thị trước khi tạo đơn.",
      "Trạng thái đơn được cập nhật theo các bước chờ xác nhận, đã xác nhận, đang giao, đã giao và hoàn tất.",
      "Khách hàng cần kiểm tra sản phẩm và xác nhận đã nhận hàng trên tài khoản.",
    ],
  },
  {
    id: "don-thue",
    title: "Nhận và trả thiết bị thuê",
    items: [
      "Thiết bị thuê hiện được nhận tại cửa hàng theo khung giờ đã chọn.",
      "Người nhận cần đúng thông tin trên hồ sơ đã xác minh và hợp đồng thuê.",
      "Nhân viên kiểm tra serial, phụ kiện, tình trạng thiết bị và lập biên bản bàn giao.",
      "Khi hoàn trả, thiết bị được kiểm tra lại trước khi xác định phí phát sinh và tiền hoàn cọc.",
    ],
  },
  {
    id: "kiem-tra",
    title: "Kiểm tra khi nhận",
    items: [
      "Đối chiếu đúng sản phẩm hoặc serial thiết bị trên đơn.",
      "Kiểm tra ngoại quan, chức năng cơ bản và phụ kiện đi kèm.",
      "Thông báo ngay cho nhân viên nếu thông tin hoặc tình trạng thực tế không khớp biên bản.",
      "Không tự ý nhận thay hoặc chuyển giao thiết bị thuê cho người không có trong giao dịch.",
    ],
  },
  {
    id: "tre-hen",
    title: "Chậm giao hoặc chậm hoàn trả",
    paragraphs: [
      "Nếu có thay đổi về lịch giao nhận, Digital Rental sẽ liên hệ bằng thông tin khách hàng đã cung cấp.",
      "Đối với đơn thuê, hoàn trả trễ có thể phát sinh phí theo hợp đồng và ảnh hưởng lịch đặt của khách hàng tiếp theo.",
    ],
    note:
      "Khách hàng nên liên hệ trước khi đến nhận, trả hoặc khi có nguy cơ không thể hoàn trả đúng thời hạn.",
  },
];

export default function DeliveryPolicyPage() {
  return (
    <PolicyPageShell
      icon={Truck}
      eyebrow="Chính sách dịch vụ"
      title="Chính sách giao nhận"
      summary="Quy định cách giao sản phẩm mua, nhận thiết bị thuê và hoàn trả tài sản để các bên chủ động kiểm tra trước mỗi giao dịch."
      updatedAt="2026-06-11"
      sections={sections}
      relatedHref="/rental-process"
      relatedLabel="Xem quy trình thuê"
    />
  );
}
