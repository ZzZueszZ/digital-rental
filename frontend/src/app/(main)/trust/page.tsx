import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FileCheck2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ScanFace,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const safeguards = [
  {
    icon: ScanFace,
    eyebrow: "Danh tính người thuê",
    title: "Xác minh trước khi giao tài sản",
    description:
      "Khách hàng cần hoàn tất eKYC trước khi đặt thuê. Quy trình kết hợp OCR giấy tờ, đối chiếu khuôn mặt, kiểm tra thực thể sống và bước xét duyệt hồ sơ.",
    points: [
      "Đối chiếu thông tin trên giấy tờ",
      "Kiểm tra khuôn mặt và liveness",
      "Đánh giá rủi ro trước khi duyệt",
    ],
  },
  {
    icon: Camera,
    eyebrow: "Tình trạng thiết bị",
    title: "Có căn cứ ở cả lúc nhận và trả",
    description:
      "Thiết bị vật lý được quản lý theo số serial. Biên bản bàn giao và hoàn trả ghi nhận tình trạng thân máy, ống kính, pin, phụ kiện và các khoản phát sinh.",
    points: [
      "Gán đúng thiết bị theo serial",
      "Ghi nhận tình trạng trước và sau thuê",
      "Lưu người lập và thời điểm biên bản",
    ],
  },
  {
    icon: Clock3,
    eyebrow: "Lịch thuê và hoàn trả",
    title: "Theo dõi xuyên suốt vòng đời đơn thuê",
    description:
      "Lịch nhận, lịch trả và trạng thái thiết bị được kiểm tra trước khi tạo đơn. Khi hoàn trả trễ hoặc có hư hỏng, hệ thống hỗ trợ ghi nhận và tính khoản phát sinh.",
    points: [
      "Kiểm tra khả dụng theo thời gian",
      "Theo dõi trạng thái đơn thuê",
      "Tính phí trễ và chi phí hư hỏng",
    ],
  },
  {
    icon: LockKeyhole,
    eyebrow: "Dữ liệu nhạy cảm",
    title: "Bảo vệ theo nhiều lớp",
    description:
      "JWT và phân quyền kiểm soát truy cập API. E2EE-Shield bổ sung mã hóa payload JSON nhạy cảm, kiểm tra AAD, timestamp và nonce để phát hiện sửa đổi hoặc phát lại.",
    points: [
      "Phân quyền theo vai trò và permission",
      "Mã hóa AES-GCM cho API thuộc policy",
      "Ràng buộc request bằng timestamp và nonce",
    ],
  },
];

const assuranceLayers = [
  {
    icon: Fingerprint,
    title: "eKYC bắt buộc",
    description: "Chỉ tài khoản có trạng thái VERIFIED mới được tạo đơn thuê.",
  },
  {
    icon: FileCheck2,
    title: "Hợp đồng điện tử",
    description: "Khách hàng xác nhận hợp đồng bằng OTP trước khi nhận thiết bị.",
  },
  {
    icon: BadgeCheck,
    title: "Biên bản giao nhận",
    description: "Tình trạng thiết bị và phụ kiện được ghi nhận trong từng giai đoạn.",
  },
  {
    icon: KeyRound,
    title: "Kiểm soát truy cập",
    description: "Staff, Admin và Super Admin thao tác theo permission được cấp.",
  },
  {
    icon: DatabaseZap,
    title: "Nhật ký nghiệp vụ",
    description: "Giao dịch, thay đổi kho và thao tác quan trọng được lưu để tra cứu.",
  },
  {
    icon: Wrench,
    title: "Quản lý theo serial",
    description: "Mỗi thiết bị vật lý có trạng thái và lịch sử tình trạng riêng.",
  },
];

const flow = [
  {
    number: "01",
    title: "Xác minh tài khoản",
    description:
      "Hoàn thiện hồ sơ và eKYC để hệ thống xác định người thực hiện giao dịch.",
  },
  {
    number: "02",
    title: "Kiểm tra lịch trống",
    description:
      "Chọn ngày nhận, ngày trả và số lượng; hệ thống kiểm tra khả dụng trước khi tạo đơn.",
  },
  {
    number: "03",
    title: "Thanh toán và ký hợp đồng",
    description:
      "Phí thuê được thanh toán qua VNPay; hợp đồng được xác nhận bằng OTP.",
  },
  {
    number: "04",
    title: "Bàn giao có biên bản",
    description:
      "Nhân viên gán thiết bị, ghi nhận tình trạng và xác nhận khoản tiền cọc.",
  },
  {
    number: "05",
    title: "Hoàn trả và đối soát",
    description:
      "Thiết bị được kiểm tra lại, tính khoản phát sinh và xác định số tiền hoàn cọc.",
  },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-red-100">
      <Navbar />

      <main>
        <section className="border-b border-zinc-200 bg-zinc-50/70">
          <div className="container mx-auto grid min-h-[620px] max-w-[1320px] items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-normal text-red-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trung tâm an toàn Digital Rental
              </div>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                Thuê thiết bị giá trị cao,
                <span className="block text-red-600">
                  cần một quy trình đáng tin cậy.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base font-normal leading-7 text-zinc-500 md:text-lg">
                Chúng tôi kết hợp xác minh danh tính, hợp đồng điện tử, quản
                lý thiết bị theo serial và bảo vệ dữ liệu để mỗi giao dịch có
                thông tin rõ ràng cho cả khách hàng lẫn đơn vị cho thuê.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Xem thiết bị
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/rental-process"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                >
                  Xem quy trình thuê
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
                <div>
                  <p className="text-xs font-normal text-zinc-400">
                    Mô hình kiểm soát
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">
                    Nhiều lớp, đúng từng rủi ro
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["01", "Xác minh danh tính", "eKYC và xét duyệt"],
                  ["02", "Ràng buộc giao dịch", "Hợp đồng và tiền cọc"],
                  ["03", "Kiểm soát tài sản", "Serial và biên bản"],
                  ["04", "Bảo vệ dữ liệu", "JWT, RBAC và E2EE"],
                ].map(([number, title, detail]) => (
                  <div
                    key={number}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
                  >
                    <span className="text-xs font-medium text-red-600">
                      {number}
                    </span>
                    <p className="mt-3 text-sm font-medium text-zinc-900">
                      {title}
                    </p>
                    <p className="mt-1 text-xs font-normal text-zinc-500">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-xs font-normal leading-5 text-emerald-800">
                  Mỗi lớp giải quyết một nhóm rủi ro riêng; không có cơ chế đơn
                  lẻ nào được xem là thay thế cho toàn bộ quy trình kiểm soát.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="mb-2 text-sm font-medium text-red-600">
                Kiểm soát rủi ro
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                Bốn rủi ro chính, bốn nhóm biện pháp
              </h2>
              <p className="mt-3 text-sm font-normal leading-6 text-zinc-500">
                Quy trình được thiết kế quanh những vấn đề thực tế của hoạt
                động cho thuê thiết bị nhiếp ảnh, thay vì chỉ tập trung vào
                bước đặt lịch.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {safeguards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-red-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-normal text-red-600">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-5 text-sm font-normal leading-6 text-zinc-500">
                    {item.description}
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-2 rounded-xl bg-zinc-50 p-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="text-xs font-normal leading-5 text-zinc-600">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="mb-2 text-sm font-medium text-red-600">
                  Cơ chế tạo niềm tin
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  Thông tin có thể kiểm tra, trách nhiệm có thể đối chiếu
                </h2>
              </div>
              <p className="max-w-md text-sm font-normal leading-6 text-zinc-500">
                Các trạng thái, biên bản và giao dịch được lưu theo từng đơn để
                hỗ trợ theo dõi và xử lý khi có phát sinh.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assuranceLayers.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-zinc-200 bg-white p-5"
                >
                  <item.icon className="h-5 w-5 text-red-600" />
                  <h3 className="mt-5 text-base font-medium text-zinc-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-6 text-zinc-500">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="max-w-lg">
                <p className="mb-2 text-sm font-medium text-red-600">
                  Một lượt thuê an toàn
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  Kiểm soát được thực hiện theo từng thời điểm
                </h2>
                <p className="mt-4 text-sm font-normal leading-6 text-zinc-500">
                  Mỗi bước tạo ra một trạng thái hoặc chứng từ mới. Điều này
                  giúp khách hàng biết đơn đang ở đâu và nhân viên biết cần
                  kiểm tra điều kiện nào trước khi chuyển bước.
                </p>
                <Link
                  href="/rental-process"
                  className="mt-7 inline-flex items-center text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                >
                  Xem quy trình chi tiết
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3">
                {flow.map((item) => (
                  <div
                    key={item.number}
                    className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-[52px_180px_1fr] sm:items-center"
                  >
                    <span className="text-sm font-semibold text-red-600">
                      {item.number}
                    </span>
                    <p className="text-sm font-medium text-zinc-900">
                      {item.title}
                    </p>
                    <p className="text-sm font-normal leading-6 text-zinc-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="rounded-xl bg-zinc-950 p-7 text-white md:p-10">
              <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <p className="text-sm font-normal text-zinc-400">
                    Minh bạch trước khi xác nhận
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    Kiểm tra lịch, chi phí và điều kiện thuê ngay trên từng sản
                    phẩm.
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
                >
                  Khám phá thiết bị
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
