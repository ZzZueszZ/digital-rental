import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FileSignature,
  PackageCheck,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const stages = [
  {
    icon: ScanFace,
    step: "Bước 01",
    title: "Hoàn tất hồ sơ và eKYC",
    description:
      "Khách hàng cung cấp giấy tờ, selfie và video liveness. Hồ sơ cần được xác minh trước khi tạo đơn thuê.",
    output: "Kết quả: tài khoản có trạng thái eKYC VERIFIED",
  },
  {
    icon: CalendarCheck2,
    step: "Bước 02",
    title: "Chọn thiết bị và thời gian",
    description:
      "Chọn ngày nhận, ngày trả, số lượng và khung giờ. Hệ thống kiểm tra lịch trống theo khoảng thời gian đã chọn.",
    output: "Kết quả: xác nhận thiết bị còn khả dụng",
  },
  {
    icon: CreditCard,
    step: "Bước 03",
    title: "Tạo đơn và thanh toán phí thuê",
    description:
      "Đơn thuê được tạo với chi phí dự kiến. Khách hàng thanh toán phí thuê trực tuyến qua VNPay.",
    output: "Kết quả: ghi nhận giao dịch và trạng thái thanh toán",
  },
  {
    icon: PackageCheck,
    step: "Bước 04",
    title: "Chuẩn bị thiết bị",
    description:
      "Nhân viên gán thiết bị vật lý theo serial, kiểm tra tình trạng và chuẩn bị nội dung hợp đồng.",
    output: "Kết quả: thiết bị được giữ cho đúng đơn thuê",
  },
  {
    icon: FileSignature,
    step: "Bước 05",
    title: "Ký hợp đồng bằng OTP",
    description:
      "Mã OTP được gửi qua email. Khách hàng kiểm tra nội dung và xác nhận ký hợp đồng điện tử.",
    output: "Kết quả: hợp đồng được ký và khóa nội dung",
  },
  {
    icon: ClipboardCheck,
    step: "Bước 06",
    title: "Thu cọc và bàn giao",
    description:
      "Nhân viên lập biên bản, ghi tình trạng thân máy, ống kính, pin, phụ kiện và xác nhận tiền cọc.",
    output: "Kết quả: đơn chuyển sang trạng thái đang thuê",
  },
  {
    icon: RotateCcw,
    step: "Bước 07",
    title: "Nhận trả và kiểm tra",
    description:
      "Thiết bị được kiểm tra lại khi hoàn trả. Hệ thống ghi nhận số ngày trễ, hư hỏng hoặc thiếu phụ kiện.",
    output: "Kết quả: xác định khoản phạt hoặc số tiền hoàn cọc",
  },
  {
    icon: BadgeCheck,
    step: "Bước 08",
    title: "Đối soát và hoàn tất",
    description:
      "Sau khi xử lý các khoản phát sinh, nhân viên hoàn tất đơn và cập nhật trạng thái thiết bị.",
    output: "Kết quả: đơn thuê hoàn tất, dữ liệu được lưu để tra cứu",
  },
];

const responsibilities = [
  {
    title: "Khách hàng chuẩn bị",
    icon: ShieldCheck,
    items: [
      "Tài khoản và email đang hoạt động",
      "Hồ sơ eKYC đã được xác minh",
      "Ngày thuê và khung giờ nhận chính xác",
      "Kiểm tra hợp đồng trước khi nhập OTP",
    ],
  },
  {
    title: "Digital Rental thực hiện",
    icon: ClipboardCheck,
    items: [
      "Kiểm tra lịch và thiết bị khả dụng",
      "Gán đúng serial cho đơn thuê",
      "Lập biên bản giao nhận và hoàn trả",
      "Hiển thị rõ phí thuê, tiền cọc và phát sinh",
    ],
  },
];

const statusNotes = [
  ["Chờ thanh toán", "Đơn đã tạo nhưng phí thuê chưa được ghi nhận."],
  ["Đã thanh toán phí thuê", "Giao dịch thành công, đơn chờ chuẩn bị."],
  ["Chờ nhận thiết bị", "Thiết bị và hợp đồng đã được chuẩn bị."],
  ["Đang thuê", "Thiết bị đã được bàn giao cho khách hàng."],
  ["Đã trả", "Thiết bị đã được nhận lại và đang đối soát."],
  ["Hoàn tất", "Mọi khoản phí và tiền cọc đã được xử lý."],
];

export default function RentalProcessPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-red-100">
      <Navbar />

      <main>
        <section className="border-b border-zinc-200 bg-zinc-50/70">
          <div className="container mx-auto grid min-h-[600px] max-w-[1320px] items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-normal text-red-700">
                <CalendarCheck2 className="h-3.5 w-3.5" />
                Quy trình thuê thiết bị
              </div>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                Từng bước rõ ràng,
                <span className="block text-red-600">
                  từ đặt lịch đến hoàn trả.
                </span>
              </h1>
              <p className="mt-6 text-base font-normal leading-7 text-zinc-500 md:text-lg">
                Mỗi giai đoạn đều có điều kiện, trạng thái và chứng từ tương
                ứng. Bạn có thể theo dõi đơn mua và đơn thuê ngay trong tài
                khoản của mình.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rentals"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Chọn thiết bị
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/trust"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                >
                  Trung tâm an toàn
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-7">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: ScanFace,
                    label: "Điều kiện thuê",
                    value: "eKYC VERIFIED",
                  },
                  {
                    icon: Clock3,
                    label: "Lịch thiết bị",
                    value: "Kiểm tra theo thời gian",
                  },
                  {
                    icon: FileSignature,
                    label: "Hợp đồng",
                    value: "Xác nhận bằng OTP",
                  },
                  {
                    icon: WalletCards,
                    label: "Chi phí",
                    value: "Hiển thị trước khi xác nhận",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
                  >
                    <item.icon className="h-4 w-4 text-red-600" />
                    <p className="mt-4 text-xs font-normal text-zinc-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-zinc-950 p-5 text-white">
                <p className="text-xs font-normal text-zinc-400">
                  Nguyên tắc vận hành
                </p>
                <p className="mt-2 text-base font-medium leading-6 text-white">
                  Không bàn giao khi chưa đủ điều kiện thanh toán, hợp đồng và
                  tiền cọc theo hồ sơ.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-[1100px] px-4 md:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-medium text-red-600">
                Toàn bộ vòng đời đơn thuê
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                Tám bước được kiểm soát liên tục
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-normal leading-6 text-zinc-500">
                Trạng thái chỉ được chuyển khi các điều kiện nghiệp vụ của bước
                hiện tại đã hoàn thành.
              </p>
            </div>

            <div className="relative">
              <div className="absolute bottom-8 left-5 top-8 hidden w-px bg-zinc-200 md:block" />
              <div className="space-y-4">
                {stages.map((stage) => (
                  <article
                    key={stage.step}
                    className="relative grid gap-5 rounded-xl border border-zinc-200 bg-white p-5 md:grid-cols-[48px_190px_1fr] md:items-start md:p-6"
                  >
                    <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <stage.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600">
                        {stage.step}
                      </p>
                      <h3 className="mt-1 text-base font-medium text-zinc-950">
                        {stage.title}
                      </h3>
                    </div>
                    <div>
                      <p className="text-sm font-normal leading-6 text-zinc-500">
                        {stage.description}
                      </p>
                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-zinc-50 px-3 py-2.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="text-xs font-normal leading-5 text-zinc-600">
                          {stage.output}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1100px] px-4 md:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-2">
              {responsibilities.map((group) => (
                <article
                  key={group.title}
                  className="rounded-xl border border-zinc-200 bg-white p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-red-600">
                      <group.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                      {group.title}
                    </h2>
                  </div>
                  <div className="mt-6 space-y-3">
                    {group.items.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <p className="text-sm font-normal leading-6 text-zinc-600">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-[1100px] px-4 md:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="mb-2 text-sm font-medium text-red-600">
                  Theo dõi đơn thuê
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  Mỗi trạng thái trả lời một câu hỏi cụ thể
                </h2>
                <p className="mt-4 text-sm font-normal leading-6 text-zinc-500">
                  Tên trạng thái được trình bày theo ngôn ngữ nghiệp vụ để
                  khách hàng và nhân viên hiểu cùng một tiến trình.
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                {statusNotes.map(([status, description], index) => (
                  <div
                    key={status}
                    className={`grid gap-2 p-4 sm:grid-cols-[180px_1fr] sm:items-center ${
                      index !== statusNotes.length - 1
                        ? "border-b border-zinc-100"
                        : ""
                    }`}
                  >
                    <span className="w-fit rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                      {status}
                    </span>
                    <p className="text-sm font-normal leading-6 text-zinc-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1100px] px-4 md:px-6 lg:px-8">
            <div className="rounded-xl border border-zinc-200 bg-white p-7 md:p-10">
              <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-red-600">
                    Sẵn sàng kiểm tra lịch?
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                    Chọn thiết bị, thời gian và xem chi phí dự kiến trước khi
                    gửi yêu cầu.
                  </h2>
                </div>
                <Link
                  href="/rentals"
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Bắt đầu chọn máy
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
