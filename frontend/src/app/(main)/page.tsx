"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Zap,
  ChevronRight,
  ShieldAlert,
  HardDrive,
  Users,
  Award,
  Video,
  Camera,
  Layers,
  Star,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductListSection } from "@/components/home/ProductListSection";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950 selection:bg-red-600/20 font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Dynamic Studio Hero */}
        <section className="relative h-[95svh] w-full flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/modern_photography_hero.png"
              alt="Professional Photography Gear"
              fill
              className="object-cover object-center opacity-80"
              priority
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-white/60" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-4xl"
            >
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/5 border border-red-600/10 mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Studio Professional Edition 2026</span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-[48px] md:text-[64px] lg:text-[84px] font-black tracking-tight text-zinc-950 mb-8 leading-[1.05]"
              >
                Khởi tạo <br />
                <span className="text-red-600 italic">
                  Tuyệt tác.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-zinc-500 mb-12 leading-relaxed max-w-xl font-medium"
              >
                Nền tảng cung ứng thiết bị nhiếp ảnh và cinema tiêu chuẩn quốc tế. 
                Nâng tầm dự án của bạn bằng hệ sinh thái công nghệ hình ảnh tối tân nhất.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-5"
              >
                <Button
                  size="lg"
                  className="group rounded-xl px-10 h-16 text-base font-bold bg-zinc-950 text-white hover:bg-red-600 shadow-2xl shadow-zinc-200 transition-all active:scale-95 border-none"
                  onClick={() => {
                    document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Khám phá Studio <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-10 h-16 text-base font-bold border-2 border-zinc-100 bg-white text-zinc-950 hover:bg-zinc-950 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  Giải pháp Doanh nghiệp
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cuộn để khám phá</span>
            <div className="w-px h-12 bg-linear-to-b from-zinc-200 to-transparent" />
          </motion.div>
        </section>

        {/* Stats Section - Premium Grid */}
        <section className="py-20 bg-white relative z-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Thiết bị sẵn sàng", value: "2,500+", icon: Camera },
                { label: "Dự án hoàn thành", value: "18k+", icon: Video },
                { label: "Nhiếp ảnh gia", value: "12k+", icon: Users },
                { label: "Giải thưởng Studio", value: "45", icon: Award },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                   <div className="flex flex-col items-center md:items-start p-8 rounded-xl bg-zinc-50/50 border border-transparent hover:border-zinc-100 hover:bg-white hover:shadow-dash-card transition-all duration-500">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-600 mb-6 group-hover:bg-red-600 group-hover:text-white transition-all">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-black text-zinc-950 mb-2 tracking-tighter">{stat.value}</h3>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                   </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Sector - Visual Focus */}
        <section className="py-24 bg-zinc-50/50 border-y border-zinc-100">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-px w-12 bg-red-600" />
                   <span className="text-xs font-black text-red-600 uppercase tracking-[0.3em]">Hệ sinh thái thiết bị</span>
                </div>
                <h2 className="text-[32px] md:text-[42px] font-bold text-zinc-950 tracking-tight leading-tight">
                  Trang bị tối tân cho <br />
                  <span className="text-zinc-400">mọi quy mô sản xuất.</span>
                </h2>
              </div>
              <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-sm mb-2">
                Chúng tôi cung cấp hệ thống giải pháp hình ảnh từ các thương hiệu dẫn đầu, đảm bảo tính tương thích và hiệu suất cao nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Cinema Systems",
                  desc: "RED, Arri, Sony Venice Suite",
                  image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop",
                  accent: "bg-zinc-950"
                },
                {
                  title: "Master Lenses",
                  desc: "Prime & Cine-Anamorphic",
                  image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=2000&auto=format&fit=crop",
                  accent: "bg-red-600"
                },
                {
                  title: "Lighting & Grip",
                  desc: "Aputure, Arri SkyPanel",
                  image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop",
                  accent: "bg-amber-500"
                },
              ].map((cat, i) => (
                <motion.div 
                  key={cat.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="group relative h-[600px] rounded-xl overflow-hidden border border-zinc-100 shadow-dash-card hover:-translate-y-2 transition-all duration-700"
                >
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/90 via-zinc-950/20 to-transparent p-10 flex flex-col justify-end">
                    <div className={cn("w-12 h-1 mb-6", cat.accent)} />
                    <p className="text-zinc-400 text-sm font-bold mb-2 uppercase tracking-widest">{cat.desc}</p>
                    <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">{cat.title}</h3>
                    <Button className="w-fit h-12 px-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white hover:text-zinc-950 transition-all group-hover:scale-105 active:scale-95">
                      Xem danh mục
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product List Sector */}
        <ProductListSection />

        {/* How It Works - Step System */}
        <section className="py-24 bg-white relative">
           <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
              <div className="text-center mb-20">
                <h2 className="text-[32px] md:text-[42px] font-bold text-zinc-950 tracking-tight mb-6">Quy trình <span className="text-red-600">tối giản.</span></h2>
                <p className="text-zinc-500 font-medium max-w-xl mx-auto">Chỉ với 4 bước đơn giản để sở hữu những thiết bị hình ảnh hàng đầu cho dự án của bạn.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {[
                  { icon: Layers, title: "Chọn thiết bị", desc: "Duyệt qua kho thiết bị khổng lồ và chọn những item phù hợp." },
                  { icon: Clock, title: "Đặt lịch thuê", desc: "Xác nhận thời gian sử dụng linh hoạt theo nhu cầu dự án." },
                  { icon: Zap, title: "Nhận Studio-ready", desc: "Thiết bị được kiểm định và sẵn sàng tác nghiệp ngay lập tức." },
                  { icon: ShieldAlert, title: "Bàn giao an toàn", desc: "Hoàn tất dự án và bàn giao thiết bị tại Studio hoặc tận nơi." },
                ].map((step, i) => (
                  <div key={i} className="relative group text-center md:text-left">
                    <div className="w-16 h-16 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 mb-8 mx-auto md:mx-0 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-red-200 transition-all duration-500">
                      <step.icon className="w-7 h-7" />
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-xs font-black text-red-600 shadow-sm">
                        0{i + 1}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-zinc-950 mb-4 tracking-tight">{step.title}</h4>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">{step.desc}</p>
                    {i < 3 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t border-dashed border-zinc-200 -translate-x-8 z-0" />
                    )}
                  </div>
                ))}
              </div>
           </div>
        </section>

        {/* Feature Sectors - Service Trust */}
        <section className="py-24 bg-zinc-50/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="relative">
                  <div className="relative aspect-4/5 rounded-xl overflow-hidden shadow-2xl border-8 border-white">
                    <Image 
                      src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop"
                      alt="Studio Work"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Floating Experience Card */}
                  <div className="absolute -bottom-10 -right-10 bg-red-600 p-10 rounded-xl text-white shadow-2xl shadow-red-200 max-w-xs hidden md:block animate-bounce-subtle">
                     <p className="text-5xl font-black mb-2 tracking-tighter">10+</p>
                     <p className="text-xs font-bold uppercase tracking-widest opacity-80">Năm kinh nghiệm trong ngành Cinema & Media</p>
                  </div>
               </div>

               <div className="space-y-12">
                  <div>
                    <h2 className="text-[32px] md:text-[42px] font-bold text-zinc-950 tracking-tight leading-tight mb-8">
                      Hơn cả một dịch vụ cho thuê. <br />
                      <span className="text-red-600">Chúng tôi là cộng sự.</span>
                    </h2>
                    <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                      Digital Rental mang đến giải pháp toàn diện cho các nhà làm phim chuyên nghiệp, từ hỗ trợ kỹ thuật tận nơi đến các gói bảo hiểm rủi ro tối ưu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { title: "Kiểm định 12 bước", desc: "Mỗi thiết bị đều được sensor-clean và kiểm tra độ sắc nét trước khi giao." },
                      { title: "Hỗ trợ kỹ thuật 24/7", desc: "Kỹ thuật viên của chúng tôi luôn sẵn sàng hỗ trợ bạn trên set quay." },
                      { title: "Bảo hiểm rủi ro", desc: "Yên tâm sáng tạo với các gói bảo hiểm thiết bị linh hoạt." },
                      { title: "Mạng lưới đối tác", desc: "Kết nối với cộng đồng Production House hàng đầu khu vực." },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-5 h-5 rounded-full bg-red-600 shrink-0 mt-1.5 flex items-center justify-center">
                           <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-950 mb-2">{item.title}</h4>
                          <p className="text-xs text-zinc-500 font-medium leading-normal">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="h-14 px-10 rounded-xl bg-zinc-950 text-white font-bold hover:bg-red-600 transition-all border-none">
                    Tìm hiểu thêm về chúng tôi
                  </Button>
               </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
             <div className="bg-zinc-950 rounded-xl p-12 md:p-24 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 opacity-10 blur-[100px]" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                   <div>
                      <Quote className="w-16 h-16 text-red-600 mb-10 opacity-50" />
                      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-12 italic">
                        &ldquo;Digital Rental đã thay đổi hoàn toàn cách chúng tôi thực hiện các dự án Cinema. Thiết bị luôn ở trạng thái hoàn hảo nhất.&rdquo;
                      </h2>
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden">
                            <img src="https://i.pravatar.cc/150?u=4" alt="Reviewer" />
                         </div>
                         <div>
                            <p className="text-lg font-bold text-white">Trần Việt Anh</p>
                            <p className="text-sm text-zinc-500 font-medium">Đạo diễn Hình ảnh (DoP) - V-Studio</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      {[
                        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop"
                      ].map((img, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-zinc-800 hover:border-red-600/50 transition-all duration-500">
                           <img src={img} className="w-full h-full object-cover opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-700" alt="Studio gallery" />
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Brands Carousel - Symbolic Trust */}
        <section className="py-20 bg-zinc-50/30 border-t border-zinc-100">
           <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
              <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-12">Authorized Dealer & Partner</p>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                 {["Canon", "Sony", "Nikon", "RED", "Arri", "Blackmagic"].map((brand) => (
                    <span key={brand} className="text-3xl font-black text-zinc-950 tracking-tighter">{brand}</span>
                 ))}
              </div>
           </div>
        </section>

        {/* Closing CTA - Full Bleed Redesign */}
        <section className="relative h-[80svh] min-h-[700px] w-full flex items-center overflow-hidden bg-white">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/studio_cta_bg.png"
              alt="Professional Photography Studio Background"
              fill
              className="object-cover object-bottom-right opacity-90"
              priority
            />
            {/* Elegant Gradients */}
            <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />
          </div>
          
          <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="max-w-3xl"
            >
              <div className="inline-flex items-center px-5 py-2 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-widest mb-10 shadow-xl shadow-red-200">
                Join our community
              </div>
              
              <h2 className="text-[42px] md:text-[62px] font-black text-zinc-950 tracking-tighter leading-[1] mb-10">
                Sẵn sàng kiến tạo <br />
                <span className="text-red-600 italic">những khung hình xuất chúng?</span>
              </h2>
              
              <p className="text-zinc-500 text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-xl">
                Tham gia mạng lưới hơn 12,000 nhiếp ảnh gia chuyên nghiệp và bắt đầu hành trình sáng tạo của bạn ngay hôm nay.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Button className="rounded-xl px-12 h-16 bg-zinc-950 text-white hover:bg-red-600 text-base font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 border-none">
                  Bắt đầu ngay
                </Button>
                <div className="flex items-center gap-4 px-6">
                   <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-zinc-100">
                           <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" />
                        </div>
                      ))}
                   </div>
                   <div className="text-xs font-bold text-zinc-400">
                      <span className="text-zinc-950 block">12k+ Members</span>
                      Active this month
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
