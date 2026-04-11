import Link from "next/link";
import { Camera, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white text-zinc-900 pt-24 pb-12 border-t border-zinc-200 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4 lg:gap-12">
          
          {/* Brand & Mission */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="group flex items-center gap-3 transition-all">
              <div className="w-10 h-10 bg-[#e85d04] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-zinc-950 leading-none">
                  Digital<span className="text-red-600">Rental</span>
                </span>
              </div>
            </Link>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xs mt-2">
              Nền tảng cung cấp dịch vụ thuê thiết bị sản xuất hình ảnh và video chuyên nghiệp hàng đầu.
            </p>
            <div className="flex gap-4 pt-4">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-white hover:border-red-600 hover:bg-red-600 transition-all duration-300">
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:col-span-3 lg:ml-auto w-full pt-4 lg:pt-0">
            {/* Column 1 */}
            <div className="space-y-6">
              <h4 className="text-[13px] font-bold text-zinc-900 tracking-widest uppercase mb-6">Danh Mục</h4>
              <ul className="space-y-4">
                {["Máy Ảnh", "Ống Kính", "Ánh Sáng", "Phụ Kiện", "Không Gian Thuê"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-6">
              <h4 className="text-[13px] font-bold text-zinc-900 tracking-widest uppercase mb-6">Dịch Vụ</h4>
              <ul className="space-y-4">
                {["Thuê Thiết Bị", "Bảo Đảm Thiết Bị", "Giao Nhận Tận Nơi", "Cho Doanh Nghiệp"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Column 3 */}
            <div className="space-y-6">
              <h4 className="text-[13px] font-bold text-zinc-900 tracking-widest uppercase mb-6">Hỗ Trợ</h4>
              <ul className="space-y-4">
                {["Trung Tâm Trợ Giúp", "Chính Sách Vận Chuyển", "Bảo Hành & Đổi Trả", "Điều Khoản Dịch Vụ"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-20 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm font-medium text-zinc-500">
            © {new Date().getFullYear()} Digital Rental. Mọi bản quyền được bảo lưu.
          </div>

          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <Link href="#" className="hover:text-zinc-900 transition-colors">Bảo Mật</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Điều Khoản</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
