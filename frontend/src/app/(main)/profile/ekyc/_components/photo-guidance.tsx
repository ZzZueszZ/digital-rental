import { Aperture, BadgeCheck, ImageIcon, ScanLine } from "lucide-react";

const GUIDANCE = [
  [Aperture, "Đủ sáng, không bị lóa", "Tránh ánh sáng chói hoặc phản chiếu."],
  [ScanLine, "Thấy rõ 4 góc CCCD", "Đặt thẻ nằm gọn trong khung hình."],
  [ImageIcon, "Ảnh rõ nét, không mờ", "Đảm bảo chữ và ảnh trên CCCD đọc được."],
  [BadgeCheck, "Ảnh gốc, không chỉnh sửa", "Không dùng ảnh chụp màn hình."],
] as const;

export function PhotoGuidance() {
  return (
    <aside className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5 lg:p-6">
      <h3 className="text-base font-semibold text-zinc-950">Hướng dẫn chụp ảnh</h3>
      <div className="mt-5 space-y-4">
        {GUIDANCE.map(([Icon, title, detail]) => (
          <div key={title} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white">
              <Icon className="size-4 text-zinc-700" />
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-900">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">{detail}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">
        Chỉ sử dụng CCCD của chính bạn. Hồ sơ không hợp lệ có thể bị từ chối.
      </p>
    </aside>
  );
}
