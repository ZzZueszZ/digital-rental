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
    <div className="flex min-h-screen flex-col bg-white text-zinc-950 selection:bg-red-600/20 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Dynamic Studio Hero */}
        <section className="relative h-[90svh] w-full flex items-center overflow-hidden border-b border-zinc-200">
          <div className="absolute inset-0 z-0">
            <Image
              src="/modern_photography_hero.png"
              alt="Professional Photography Gear"
              fill
              className="object-cover object-center opacity-70"
              priority
            />
            {/* Cinematic Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-zinc-50 via-zinc-50/70 to-transparent" />
            <div className="absolute inset-0 bg-zinc-50/20" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-4xl"
            >
              {/* Removed badge to match minimalist layout of the reference image */}

              <motion.h1
                variants={itemVariants}
                className="text-[36px] md:text-[44px] lg:text-[44px] font-bold tracking-tight text-zinc-900 mb-8 leading-[1.2]"
              >
                Khởi tạo <br className="hidden md:block" />
                <span className="text-red-600 italic pr-2">
                  Tuyệt tác.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-base md:text-lg text-zinc-500 mb-12 leading-[1.6] max-w-xl font-medium"
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
                  className="rounded-full px-8 h-12 text-[14px] md:text-[16px] font-semibold tracking-wide bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  KHÁM PHÁ THIẾT BỊ
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 text-[14px] md:text-[16px] font-semibold tracking-wide border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95"
                >
                  BẮT ĐẦU THUÊ
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Category Sector */}
        <section className="flex items-center py-8 bg-zinc-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-5 mb-10">
              <div className="max-w-xl">
                <h2 className="text-[28px] md:text-[32px] font-semibold text-zinc-950 tracking-tight mb-4 leading-[1.3]">
                  <span className="text-red-600 italic pr-2">
                    Hệ sinh thái.
                  </span>
                </h2>
                <p className="text-zinc-500 text-base font-medium leading-[1.6] max-w-lg mt-4">
                  Lựa chọn từ các thương hiệu máy ảnh và ống kính hàng đầu thế
                  giới để hoàn thiện bộ công cụ hình ảnh của bạn.
                </p>
              </div>
              <Button
                variant="link"
                className="text-zinc-900 hover:text-red-600 font-bold tracking-widest text-xs transition-all uppercase"
              >
                KHÁM PHÁ THIẾT BỊ <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  <div className="relative h-[60svh] max-h-[500px] min-h-[350px] rounded-[2.5rem] overflow-hidden border border-zinc-200 bg-white shadow-xs transition-all duration-700 group-hover:border-red-600/30 group-hover:shadow-[0_20px_60px_rgba(220,38,38,0.1)]">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover opacity-85 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-50/90 via-zinc-50/30 to-transparent flex flex-col justify-end p-8">
                      <p className="text-red-600 text-xs font-bold tracking-widest uppercase mb-3">
                        {cat.desc}
                      </p>
                      <h3 className="text-[22px] md:text-[24px] font-semibold text-zinc-950 tracking-tight mb-4 leading-[1.3]">
                        {cat.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-500 font-medium tracking-wide text-xs">
                          {cat.count} Thiết bị sẵn sàng
                        </span>
                        <div className="flex-1 h-px bg-zinc-200" />
                        <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
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
        <section className="py-12 bg-zinc-50 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-600 opacity-[0.02] blur-[120px] pointer-events-none rounded-full" />

          <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="text-center mb-10">
              <h2 className="text-[28px] md:text-[32px] font-semibold text-zinc-950 tracking-tight mb-4 leading-[1.3]">
                Dịch vụ <span className="text-red-600 italic">Đỉnh cao.</span>
              </h2>
              <p className="text-zinc-500 text-base font-medium leading-[1.6]">
                Bảo chứng cho chất lượng và độ tín nhiệm hàng đầu trong ngành
                thuê mua thiết bị.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  className="group relative p-6 rounded-2xl bg-white border border-zinc-200 hover:border-red-600/30 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-0 group-hover:opacity-[0.03] blur-[60px] transition-opacity duration-500" />

                  <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-red-600 mb-6 transition-all duration-500 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white shadow-xs group-hover:shadow-lg">
                    {f.icon}
                  </div>

                  <h4 className="text-[18px] md:text-[20px] font-medium text-zinc-900 mb-4 leading-[1.3]">
                    {f.title}
                  </h4>
                  <p className="text-zinc-500 text-[14px] leading-[1.6] font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA - Full Bleed Redesign */}
        <section className="relative h-[70svh] min-h-[600px] w-full flex items-center overflow-hidden border-t border-zinc-200 bg-zinc-50">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/studio_cta_bg.png"
              alt="Professional Photography Studio Background"
              fill
              className="object-cover object-bottom-right opacity-70 mix-blend-multiply"
              priority
            />
            {/* Gradient overlay to ensure text is readable on the left */}
            <div className="absolute inset-0 bg-linear-to-r from-zinc-50 via-zinc-50/70 to-transparent" />
            <div className="absolute inset-0 bg-zinc-50/10" />
          </div>
          
          {/* Content Container (Left Aligned) */}
          <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="max-w-2xl px-4 md:px-0">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-600 mb-8">
                <span className="text-[12px] font-bold text-white tracking-widest uppercase">
                  Ưu Đãi Giới Hạn
                </span>
              </div>
              
              {/* Heading */}
              <h2 className="text-[28px] md:text-[32px] font-semibold text-zinc-950 tracking-tight leading-[1.2] uppercase mb-8">
                SẴN SÀNG KIẾN TẠO <br />KHUNG HÌNH XUẤT CHÚNG
              </h2>
              
              {/* Subtitle */}
              <p className="text-zinc-500 text-base md:text-[18px] font-medium mb-12 leading-[1.6] max-w-lg">
                Tham gia cộng đồng chuyên nghiệp trong chuỗi trải nghiệm 3 ngày cùng mạng lưới thiết bị lớn nhất bắt đầu tại Digital Rental.
              </p>
              
              {/* Button */}
              <Button className="rounded-full px-10 h-14 bg-zinc-900 text-white hover:bg-black text-sm font-bold tracking-[0.08em] uppercase shadow-lg transition-all active:scale-95 border-none">
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
