import Link from "next/link";
import {
  Camera,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

const footerGroups = [
  {
    title: "Danh mục",
    links: [
      { label: "Máy ảnh", href: "/rentals" },
      { label: "Ống kính", href: "/rentals" },
      { label: "Ánh sáng", href: "/rentals" },
      { label: "Phụ kiện", href: "/#product-section" },
    ],
  },
  {
    title: "Dịch vụ",
    links: [
      { label: "Thuê thiết bị", href: "/rentals" },
      { label: "Mua thiết bị", href: "/#product-section" },
      { label: "Hỗ trợ eKYC", href: "/profile/ekyc" },
      { label: "Dành cho doanh nghiệp", href: "/about" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp", href: "/about" },
      { label: "Chính sách giao nhận", href: "#" },
      { label: "Bảo hành và đổi trả", href: "#" },
      { label: "Điều khoản dịch vụ", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-200 bg-white text-zinc-900">
      <div className="container mx-auto max-w-[1320px] px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-semibold tracking-tight text-zinc-950">
                Digital<span className="text-red-600">Rental</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm font-normal leading-6 text-zinc-500">
              Nền tảng mua và thuê thiết bị hình ảnh chuyên nghiệp với quy trình
              rõ ràng, thiết bị được kiểm tra kỹ và hỗ trợ xuyên suốt dự án.
            </p>

            <div className="mt-6 space-y-2.5 text-sm font-normal text-zinc-500">
              <a
                href="tel:0909123456"
                className="flex items-center gap-2.5 transition-colors hover:text-zinc-900"
              >
                <Phone className="h-4 w-4 text-zinc-400" />
                0909 123 456
              </a>
              <a
                href="mailto:support@digitalrental.vn"
                className="flex items-center gap-2.5 transition-colors hover:text-zinc-900"
              >
                <Mail className="h-4 w-4 text-zinc-400" />
                support@digitalrental.vn
              </a>
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                Số 1, Võ Văn Ngân, TP. Thủ Đức
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-medium text-zinc-900">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-normal text-zinc-500 transition-colors hover:text-red-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-normal text-zinc-400">
            © {new Date().getFullYear()} Digital Rental. Mọi quyền được bảo lưu.
          </p>

          <div className="flex items-center gap-2">
            {[
              { label: "Instagram", icon: Instagram },
              { label: "Facebook", icon: Facebook },
              { label: "Youtube", icon: Youtube },
            ].map(({ label, icon: Icon }) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
              >
                <Icon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>

          <div className="flex gap-5 text-xs font-normal text-zinc-400">
            <Link href="#" className="transition-colors hover:text-zinc-900">
              Bảo mật
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-900">
              Điều khoản
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-900">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
