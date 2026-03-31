"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Zap,
  ChevronRight,
  ShieldAlert,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductListSection } from "@/components/home/ProductListSection";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8 } },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0c] text-white selection:bg-[#ff8c5a]/30 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Dynamic Studio Hero */}
        <section className="relative h-[90svh] w-full flex items-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <Image
              src="/modern_photography_hero.png"
              alt="Professional Photography Gear"
              fill
              className="object-cover object-center opacity-40 grayscale"
              priority
            />
            {/* Cinematic Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent" />
            <div className="absolute inset-0 bg-[#0c0c0c]/20" />
          </div>

          <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-[1600px]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-4xl"
            >
              {/* Removed badge to match minimalist layout of the reference image */}

              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white mb-6 leading-[1.1]"
              >
                Khởi tạo <br className="hidden md:block" />
                <span className="bg-linear-to-br from-[#ffd9c7] to-[#ff8c5a] bg-clip-text text-transparent italic pr-2">
                  Tuyệt tác.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-[1.125rem] md:text-xl text-on-surface-variant mb-10 leading-relaxed max-w-xl font-medium"
              >
                Giải pháp thuê thiết bị nhiếp ảnh và cinema chuyên nghiệp hàng
                đầu. Nâng tầm sáng tạo với hệ sinh thái trang thiết bị đỉnh cao.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 mt-2"
              >
                <Button
                  size="lg"
                  className="rounded-full px-8 h-13 text-[0.8rem] font-bold tracking-[0.05em] bg-[#ff8c5a] text-[#131313] hover:bg-[#ffae8f] shadow-[0_4px_20px_rgba(255,140,90,0.3)] transition-all active:scale-95"
                >
                  KHÁM PHÁ THIẾT BỊ
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-13 text-[0.8rem] font-bold tracking-[0.05em] border-transparent bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white transition-all active:scale-95"
                >
                  BẮT ĐẦU THUÊ
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Category Sector */}
        <section className="min-h-svh flex items-center py-10 bg-[#0c0c0c]">
          <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-12">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-[3.5rem] font-bold text-white tracking-tight mb-4 leading-tight">
                  <span className="bg-linear-to-br from-[#ffd9c7] to-[#ff8c5a] bg-clip-text text-transparent italic pr-2">
                    Hệ sinh thái.
                  </span>
                </h2>
                <p className="text-on-surface-variant text-base md:text-lg font-medium leading-relaxed max-w-lg mt-4">
                  Lựa chọn từ các thương hiệu máy ảnh và ống kính hàng đầu thế
                  giới để hoàn thiện bộ công cụ hình ảnh của bạn.
                </p>
              </div>
              <Button
                variant="link"
                className="text-white hover:text-[#ff8c5a] font-bold tracking-widest text-xs transition-all uppercase"
              >
                KHÁM PHÁ THIẾT BỊ <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Ống Kính Suite",
                  desc: "Prime & Zoom Professional",
                  count: "450+",
                  image:
                    "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=2000&auto=format&fit=crop",
                },
                {
                  title: "Thân Máy Cinema",
                  desc: "Ultra High Bitrate Systems",
                  count: "120+",
                  image:
                    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop",
                },
                {
                  title: "Ánh Sáng Studio",
                  desc: "Gaffer Grade Equipment",
                  count: "80+",
                  image:
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop",
                },
              ].map((cat) => (
                <div key={cat.title} className="group cursor-pointer">
                  <div className="relative h-[60svh] max-h-[500px] min-h-[350px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#111111] transition-all duration-700 group-hover:border-[#ff8c5a]/30 group-hover:shadow-[0_40px_100px_rgba(255,140,90,0.1)]">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover opacity-30 grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-70"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-transparent to-transparent flex flex-col justify-end p-12">
                      <p className="text-[#ff8c5a] text-xs font-bold tracking-widest uppercase mb-3">
                        {cat.desc}
                      </p>
                      <h3 className="text-3xl font-bold text-white tracking-tight mb-4">
                        {cat.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-on-surface-variant font-medium tracking-wide text-xs">
                          {cat.count} Thiết bị sẵn sàng
                        </span>
                        <div className="flex-1 h-px bg-white/10" />
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#ff8c5a] group-hover:text-[#131313] transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product List Sector */}
        <ProductListSection />

        {/* Feature Sectors - Premium Redesign */}
        <section className="py-32 bg-[#0c0c0c] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ff8c5a] opacity-[0.03] blur-[120px] pointer-events-none rounded-full" />

          <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-[1600px]">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Dịch vụ <span className="text-[#ff8c5a] italic">Đỉnh cao.</span>
              </h2>
              <p className="text-on-surface-variant font-medium">
                Bảo chứng cho chất lượng và độ tín nhiệm hàng đầu trong ngành
                thuê mua thiết bị.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <ShieldAlert className="w-8 h-8" />,
                  title: "Bảo hiểm Toàn diện",
                  desc: "Chính sách bảo hiểm minh bạch, bảo vệ quyền lợi tối đa cho rủi ro hư hỏng thiết bị.",
                },
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: "Giao nhận Tốc hành",
                  desc: "Mạng lưới hậu cần chuyên nghiệp, đảm bảo giao thiết bị đúng nơi, đúng thời điểm.",
                },
                {
                  icon: <HardDrive className="w-8 h-8" />,
                  title: "Kiểm định Gắt gao",
                  desc: "Mỗi thiết bị đều trải qua quy trình kiểm tra 12 bước trước khi bàn giao cho bạn.",
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: "Hỗ trợ 24/7",
                  desc: "Đội ngũ kỹ thuật viên túc trực để giải quyết mọi vấn đề phát sinh tức thì.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group relative p-8 rounded-[2.5rem] bg-[#111111] border border-white/5 hover:border-[#ff8c5a]/30 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_80px_rgba(255,140,90,0.08)] hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff8c5a] opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500" />

                  <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-[#ff8c5a] mb-8 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#ff8c5a] group-hover:text-black shadow-lg">
                    {f.icon}
                  </div>

                  <h4 className="text-xl font-bold text-white mb-4">
                    {f.title}
                  </h4>
                  <p className="text-[#888888] text-sm leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA - Full Bleed Redesign */}
        <section className="relative h-[70svh] min-h-[600px] w-full flex items-center overflow-hidden border-t border-white/5 bg-[#0c0c0c]">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/studio_cta_bg.png"
              alt="Professional Photography Studio Background"
              fill
              className="object-cover object-bottom-right mix-blend-lighten opacity-80"
              priority
            />
            {/* Gradient overlay to ensure text is readable on the left */}
            <div className="absolute inset-0 bg-linear-to-r from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent" />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          
          {/* Content Container (Left Aligned) */}
          <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-[1600px]">
            <div className="max-w-2xl px-4 md:px-0">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#efc352] mb-6">
                <span className="text-[11px] font-black text-black tracking-[0.08em] uppercase">
                  Ưu Đãi Giới Hạn
                </span>
              </div>
              
              {/* Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-black text-white tracking-tight leading-[1.1] uppercase mb-6">
                SẴN SÀNG KIẾN TẠO <br />KHUNG HÌNH XUẤT CHÚNG
              </h2>
              
              {/* Subtitle */}
              <p className="text-[#a1a1aa] text-base md:text-[1.125rem] font-medium mb-10 leading-relaxed max-w-lg">
                Tham gia cộng đồng chuyên nghiệp trong chuỗi trải nghiệm 3 ngày cùng mạng lưới thiết bị lớn nhất bắt đầu tại Digital Rental.
              </p>
              
              {/* Button */}
              <Button className="rounded-full px-10 h-14 bg-[#e85d04] text-white hover:bg-[#ff7b00] text-sm font-bold tracking-[0.08em] uppercase shadow-[0_4px_20px_rgba(232,93,4,0.3)] transition-all active:scale-95 border-none">
                BẮT ĐẦU NGAY
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
