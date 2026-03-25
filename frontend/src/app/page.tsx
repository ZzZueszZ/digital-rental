"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Clock, 
  Sparkles,
  Zap,
  ChevronRight,
  ShieldAlert,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
              <motion.div variants={itemVariants}>
                <Badge variant="secondary" className="mb-10 px-6 py-2 text-[10px] rounded-full bg-[#ff8c5a]/10 text-[#ff8c5a] border-[#ff8c5a]/20 uppercase tracking-[0.4em] font-black">
                  <Sparkles className="h-3 w-3 mr-3 inline" />
                  Studio Visuals v3.0
                </Badge>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants} 
                className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-10 leading-[0.85] uppercase font-heading"
              >
                KHỞI TẠO <br />
                <span className="text-[#ff8c5a]">TUYỆT TÁC.</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-zinc-500 mb-14 leading-relaxed max-w-xl font-bold uppercase tracking-widest"
              >
                Giải pháp thuê thiết bị nhiếp ảnh và cinema chuyên nghiệp hàng đầu.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6">
                <Button size="lg" className="rounded-full px-12 h-20 text-xs font-black uppercase tracking-[0.4em] bg-[#ff8c5a] text-black hover:bg-[#ffae8f] shadow-2xl active:scale-95 transition-all">
                  Thuê Thiết Bị
                  <ArrowRight className="ml-4 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-12 h-20 text-xs font-black uppercase tracking-[0.4em] border-white/10 text-white hover:bg-white/5 transition-all active:scale-95">
                  Về Chúng Tôi
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Category Sector */}
        <section className="py-40 bg-[#0c0c0c]">
          <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-24">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase font-heading mb-6 italic">Hệ Sinh Thái</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] leading-relaxed">
                  Lựa chọn từ các thương hiệu máy ảnh và ống kính hàng đầu thế giới.
                </p>
              </div>
              <Button variant="link" className="text-[#ff8c5a] hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all">
                Khám phá kho vũ khí <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { title: "Ống Kính Suite", desc: "Prime & Zoom Professional", count: "450+", image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=2000&auto=format&fit=crop" },
                { title: "Thân Máy Cinema", desc: "Ultra High Bitrate Systems", count: "120+", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop" },
                { title: "Ánh Sáng Studio", desc: "Gaffer Grade Equipment", count: "80+", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop" },
              ].map((cat) => (
                <div key={cat.title} className="group cursor-pointer">
                  <div className="relative h-[650px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#111111] transition-all duration-700 group-hover:border-[#ff8c5a]/30 group-hover:shadow-[0_40px_100px_rgba(255,140,90,0.1)]">
                    <Image 
                      src={cat.image} 
                      alt={cat.title} 
                      fill 
                      className="object-cover opacity-30 grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-70" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-transparent to-transparent flex flex-col justify-end p-12">
                      <p className="text-[#ff8c5a] text-[10px] font-black uppercase tracking-[0.4em] mb-4">{cat.desc}</p>
                      <h3 className="text-4xl font-black text-white uppercase font-heading leading-none mb-4">{cat.title}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">{cat.count} Thiết bị sẵn sàng</span>
                        <div className="flex-1 h-px bg-white/10" />
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#ff8c5a] group-hover:text-black transition-all">
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

        {/* Feature Sectors */}
        <section className="py-40 bg-[#0c0c0c] border-y border-white/5">
          <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
              {[
                { icon: <ShieldAlert />, title: "Bảo hiểm Trọn Gói", desc: "Yên tâm tác nghiệp với các gói bảo hiểm hư hỏng toàn diện." },
                { icon: <Clock />, title: "Giao nhận 24H", desc: "Hệ thống logistics chuyên nghiệp đảm bảo thiết bị đúng hẹn." },
                { icon: <HardDrive />, title: "Kiểm định Pro", desc: "Chất lượng thiết bị luôn ở mức hoàn hảo trước khi xuất kho." },
                { icon: <Zap />, title: "Ưu tiên Thành viên", desc: "Đặt thuê tức thì với hệ thống hàng chờ thông minh." },
              ].map((f, i) => (
                <div key={i} className="space-y-6 group">
                  <div className="w-14 h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center text-[#ff8c5a] transition-all duration-500 group-hover:bg-[#ff8c5a] group-hover:text-black group-hover:-translate-y-2">
                    {f.icon}
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tighter">{f.title}</h4>
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px] leading-relaxed italic">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-60 relative overflow-hidden bg-[#0c0c0c]">
           <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-[1600px] text-center">
             <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase font-heading mb-12">STUDIO <br /> <span className="text-[#ff8c5a] italic">CONNECT.</span></h2>
             <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-16 max-w-2xl mx-auto leading-relaxed px-4">
               Trở thành một phần của cộng đồng sáng tạo hình ảnh chuyên nghiệp. Đăng ký ngay để nhận ưu đãi cho lần thuê đầu tiên.
             </p>
             <div className="flex justify-center">
                <Button className="rounded-full px-20 h-24 bg-white text-black hover:bg-[#ff8c5a] font-black uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-95 transition-all group">
                  Đăng Ký Ngay <ArrowRight className="ml-5 w-6 h-6 group-hover:translate-x-3 transition-transform" />
                </Button>
             </div>
           </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
