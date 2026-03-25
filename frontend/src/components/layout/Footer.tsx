import Link from "next/link";
import { Camera, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0c0c0c] text-white pt-24 pb-12 border-t border-white/5 overflow-hidden relative select-none">
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px] relative z-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4 lg:gap-8">
          
          {/* Brand & Mission */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            <Link href="/" className="group flex items-center gap-4 transition-all">
              <div className="w-12 h-12 bg-[#ff8c5a] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-700">
                <Camera className="h-6 w-6 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase font-heading leading-none">Studio</span>
                <span className="text-xl font-black tracking-tighter text-[#ff8c5a] uppercase font-heading leading-none">Visuals</span>
              </div>
            </Link>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest max-w-md leading-loose">
              Dịch vụ cho thuê thiết bị nhiếp ảnh hàng đầu. Nâng tầm tác phẩm của bạn với hệ thống Gear chất lượng nhất.
            </p>
            <div className="flex gap-4 pt-4">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-[#ff8c5a] hover:bg-zinc-800 transition-all">
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-[#ff8c5a] uppercase tracking-[0.4em]">Danh Mục</h4>
              <ul className="space-y-4">
                {["Ống Kính Suite", "Máy Ảnh Cinema", "Ánh Sáng Studio", "Không Gian Thuê"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-[#ff8c5a] uppercase tracking-[0.4em]">Hỗ Trợ</h4>
              <ul className="space-y-4">
                {["Trung Tâm Trợ Giúp", "Vận Chuyển", "Chính Sách Thuê", "Bảo Mật"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter & Copyright */}
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
            <span>© 2026 Studio Visuals Inc.</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c5a]" />
            <span>Đã Đăng Ký Bản Quyền</span>
          </div>

          <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600">
            <Link href="#" className="hover:text-[#ff8c5a] transition-colors">Bảo Mật</Link>
            <Link href="#" className="hover:text-[#ff8c5a] transition-colors">Điều Khoản</Link>
            <Link href="#" className="hover:text-[#ff8c5a] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
