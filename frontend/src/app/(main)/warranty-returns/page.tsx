import { RefreshCcw } from "lucide-react";

import {
  PolicyPageShell,
  type PolicySection,
} from "@/components/legal/PolicyPageShell";

const sections: PolicySection[] = [
  {
    id: "pham-vi",
    title: "Phạm vi bảo hành và đổi trả",
    paragraphs: [
      "Chính sách áp dụng cho sản phẩm được mua tại Digital Rental và việc xử lý sự cố đối với thiết bị đang trong thời gian thuê.",
      "Điều kiện cụ thể còn phụ thuộc chính sách nhà sản xuất, tình trạng thực tế, chứng từ giao dịch và kết quả kiểm tra kỹ thuật.",
    ],
  },
  {
    id: "san-pham-mua",
    title: "Sản phẩm mua",
    items: [
      "Sản phẩm cần có thông tin đơn hàng và còn trong thời hạn bảo hành áp dụng.",
      "Lỗi phải thuộc phạm vi kỹ thuật hoặc lỗi từ nhà sản xuất, không do sử dụng sai hướng dẫn.",
      "Sản phẩm gửi kiểm tra cần kèm phụ kiện liên quan nếu lỗi có thể phát sinh từ phụ kiện.",
      "Kết quả sửa chữa, thay thế hoặc đổi trả được xác định sau khi kiểm tra tình trạng thực tế.",
    ],
  },
  {
    id: "thiet-bi-thue",
    title: "Thiết bị đang thuê",
    items: [
      "Khách hàng cần dừng sử dụng và liên hệ ngay khi phát hiện thiết bị hoạt động bất thường.",
      "Không tự ý tháo, sửa chữa hoặc giao thiết bị cho bên thứ ba xử lý.",
      "Digital Rental đối chiếu tình trạng với biên bản bàn giao và lịch sử thiết bị.",
      "Nếu lỗi không xuất phát từ khách hàng, phương án hỗ trợ có thể gồm hướng dẫn xử lý hoặc thay thiết bị khi có sẵn.",
    ],
  },
  {
    id: "khong-ap-dung",
    title: "Trường hợp không áp dụng",
    items: [
      "Thiết bị bị rơi, va đập, vào nước, cháy nổ hoặc sử dụng sai điều kiện khuyến nghị.",
      "Serial, tem hoặc thông tin nhận diện bị thay đổi hay không còn đối chiếu được.",
      "Sản phẩm bị can thiệp kỹ thuật bởi đơn vị không được chấp thuận.",
      "Hao mòn tự nhiên, phụ kiện tiêu hao hoặc lỗi phát sinh do bảo quản không phù hợp.",
    ],
  },
  {
    id: "quy-trinh",
    title: "Quy trình tiếp nhận",
    items: [
      "Khách hàng cung cấp mã đơn, mô tả lỗi và hình ảnh hoặc video nếu có.",
      "Nhân viên tiếp nhận, kiểm tra và đối chiếu thông tin giao dịch.",
      "Kết quả đánh giá cùng phương án xử lý được thông báo sau khi kiểm tra.",
      "Các khoản phí chỉ phát sinh khi có căn cứ và được thông tin trước khi thực hiện.",
    ],
    note:
      "Nội dung trên là nguyên tắc vận hành của hệ thống, không thay thế điều kiện bảo hành riêng của từng hãng sản xuất.",
  },
];

export default function WarrantyReturnsPage() {
  return (
    <PolicyPageShell
      icon={RefreshCcw}
      eyebrow="Chính sách dịch vụ"
      title="Bảo hành và đổi trả"
      summary="Quy định nguyên tắc tiếp nhận, kiểm tra và xử lý sản phẩm mua hoặc thiết bị thuê khi phát sinh lỗi trong quá trình sử dụng."
      updatedAt="2026-06-11"
      sections={sections}
      relatedHref="/trust"
      relatedLabel="Xem trung tâm an toàn"
    />
  );
}
