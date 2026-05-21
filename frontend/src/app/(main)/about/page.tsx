"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Shield,
  Clock,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Zap,
  Target,
  Users,
  Award,
  History,
  Quote,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportSubject } from "@/types/support";
import { useSubmitTicket } from "@/services/support";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SUBJECT_OPTIONS = [
  { value: SupportSubject.PRODUCT_INQUIRY, label: "Thông tin sản phẩm" },
  { value: SupportSubject.ORDER_ISSUE, label: "Vấn đề đơn hàng" },
  { value: SupportSubject.PAYMENT_ISSUE, label: "Vấn đề thanh toán" },
  { value: SupportSubject.TECHNICAL_SUPPORT, label: "Hỗ trợ kỹ thuật" },
  { value: SupportSubject.OTHER, label: "Vấn đề khác" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SupportSubject.OTHER,
    message: "",
  });

  const { mutate: submitTicket, isPending } = useSubmitTicket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTicket(formData, {
      onSuccess: () => {
        toast.success(
          "Gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ phản hồi sớm nhất.",
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: SupportSubject.PRODUCT_INQUIRY,
          message: "",
        });
      },
      onError: (error: unknown) => {
        console.error("Support submission error:", error);
        const errorMessage = (
          error as { response?: { data?: { message?: string } } }
        )?.response?.data?.message;
        toast.error(errorMessage || "Đã có lỗi xảy ra, vui lòng thử lại sau.");
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white selection:bg-red-600/10">
      {/* Hero Section - Light & Airy */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-50/50 rounded-full blur-[120px] -z-10 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-100/50 rounded-full blur-[100px] -z-10 opacity-40" />

        <div className="container px-4 mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-xl shadow-zinc-200"
            >
              <Sparkles className="w-3 h-3 text-red-500" />
              Studio Visuals Story
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-[54px] md:text-[84px] font-black text-zinc-950 tracking-tighter leading-[0.95] mb-10"
            >
              Kiến tạo <span className="text-red-600 italic">tương lai</span>{" "}
              <br />
              của ngành hình ảnh.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-medium leading-relaxed mb-12"
            >
              Chúng tôi không chỉ cho thuê thiết bị. Chúng tôi cung cấp chìa
              khóa để hiện thực hóa mọi tầm nhìn sáng tạo của các nhiếp ảnh gia
              và nhà làm phim.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Button className="h-16 px-10 rounded-xl bg-zinc-950 text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 hover:text-white transition-all shadow-2xl shadow-zinc-200 active:scale-95 border-none">
                Khám phá ngay
              </Button>
              <Button className="h-16 px-10 rounded-xl border-2 border-zinc-200 bg-white text-zinc-950 font-black uppercase tracking-widest text-xs hover:bg-zinc-950 hover:text-white transition-all active:scale-95 shadow-sm">
                Liên hệ hợp tác
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story Section - The Journey */}
      <section className="py-24 bg-white relative">
        <div className="container px-4 mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="relative aspect-4/5 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                <Image
                  src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop"
                  alt="Our beginning"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/40 to-transparent" />
              </div>
              <div className="absolute -bottom-10 -right-10 p-10 rounded-[2.5rem] bg-white border border-zinc-100 shadow-2xl max-w-[280px] hidden md:block">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-red-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Since 2016
                  </span>
                </div>
                <p className="text-sm font-bold text-zinc-700 leading-relaxed italic">
                  &quot;Bắt đầu từ một Studio nhỏ tại Thủ Đức, chúng tôi hiểu rõ
                  nỗi lo của các nghệ sĩ về trang thiết bị.&quot;
                </p>
              </div>
            </motion.div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 bg-red-600" />
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                    Hành trình của chúng tôi
                  </span>
                </div>
                <h2 className="text-[36px] md:text-[48px] font-bold text-zinc-950 tracking-tight leading-tight">
                  Từ niềm đam mê <br />
                  đến hệ sinh thái hàng đầu.
                </h2>
              </div>
              <div className="space-y-6 text-zinc-500 text-base md:text-lg font-medium leading-relaxed">
                <p>
                  Câu chuyện của Studio Visuals bắt đầu từ 8 năm trước, khi một
                  nhóm nhiếp ảnh gia trẻ nhận ra rào cản lớn nhất đối với sự
                  sáng tạo chính là chi phí đầu tư thiết bị. Những chiếc máy ảnh
                  Cinema đắt đỏ hay ống kính Master Prime dường như là điều
                  không tưởng đối với những người mới bắt đầu.
                </p>
                <p>
                  Với mục tiêu &quot;Dân chủ hóa thiết bị hình ảnh&quot;, chúng
                  tôi đã xây dựng Digital Rental - không chỉ là một cửa hàng cho
                  thuê, mà là một cộng đồng nơi mọi ý tưởng đều có cơ hội trở
                  thành hiện thực với chi phí tối ưu nhất.
                </p>
                <p>
                  &quot;Studio Visuals không chỉ là nơi cho thuê máy ảnh. Đó là
                  nơi niềm đam mê được chấp cánh.&quot; Hôm nay, chúng tôi tự
                  hào là đối tác chiến lược của hơn 50 Production House lớn nhỏ
                  và là điểm đến tin cậy của hơn 12,000 nghệ sĩ hình ảnh trên
                  khắp cả nước.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div>
                  <h4 className="text-4xl font-black text-zinc-950 mb-2">
                    2.5k+
                  </h4>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Thiết bị hiện có
                  </p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-zinc-950 mb-2">
                    12k+
                  </h4>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Khách hàng tin tưởng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission - Clean Cards */}
      <section className="py-24 bg-zinc-50/50 border-y border-zinc-100">
        <div className="container px-4 mx-auto max-w-[1600px]">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-[32px] md:text-[42px] font-bold text-zinc-950 tracking-tight">
              Giá trị chúng tôi <span className="text-red-600">cam kết.</span>
            </h2>
            <p className="text-zinc-500 font-medium">
              Chúng tôi xây dựng thương hiệu dựa trên sự minh bạch, chất lượng
              và tinh thần đồng hành cùng nghệ sĩ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Tầm Nhìn",
                desc: "Trở thành hệ sinh thái cung ứng giải pháp hình ảnh chuyên nghiệp và thân thiện nhất tại Đông Nam Á vào năm 2030.",
              },
              {
                icon: Heart,
                title: "Sứ Mệnh",
                desc: "Trao quyền cho các nhà sáng tạo nội dung tiếp cận với những công nghệ tối tân nhất, xóa bỏ mọi rào cản về tài chính.",
              },
              {
                icon: Shield,
                title: "Giá Trị Cốt Lõi",
                desc: "Sự trung thực trong kinh doanh, sự tỉ mỉ trong kỹ thuật và sự tận tâm trong dịch vụ khách hàng là kim chỉ nam của chúng tôi.",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="group p-10 bg-white rounded-[2.5rem] border border-zinc-100 shadow-dash-card transition-all duration-500"
              >
                <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-8 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-red-200 transition-all duration-500">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-950 mb-4">
                  {card.title}
                </h3>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container px-4 mx-auto max-w-[1600px]">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-[32px] md:text-[42px] font-bold text-zinc-950 tracking-tight leading-tight">
                Những cột mốc <br />
                <span className="text-zinc-400 italic">đáng nhớ.</span>
              </h2>
            </div>
            <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-sm">
              Mỗi năm trôi qua là một bước tiến mới trong việc nâng cấp dịch vụ
              và mở rộng hệ sinh thái.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
            {[
              {
                year: "2016",
                title: "Khởi tạo",
                desc: "Thành lập tại một Studio nhỏ với 10 máy ảnh Canon & Nikon.",
              },
              {
                year: "2018",
                title: "Vươn mình",
                desc: "Mở rộng sang mảng Cinema với hệ thống máy quay RED và Arri.",
              },
              {
                year: "2021",
                title: "Số hóa",
                desc: "Ra mắt nền tảng đặt thuê trực tuyến Digital Rental chuyên nghiệp.",
              },
              {
                year: "2024",
                title: "Dẫn đầu",
                desc: "Trở thành đơn vị có kho thiết bị đa dạng nhất khu vực phía Nam.",
              },
            ].map((m, idx) => (
              <div
                key={idx}
                className="p-10 border border-zinc-100 hover:bg-zinc-50 transition-all duration-500"
              >
                <span className="text-5xl font-black text-zinc-100 group-hover:text-red-100 mb-6 block transition-colors">
                  {m.year}
                </span>
                <h4 className="text-xl font-bold text-zinc-950 mb-3">
                  {m.title}
                </h4>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Quote */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        {/* Subtle decoration to match Home testimonials */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[100px]" />

        <div className="container px-4 mx-auto text-center relative z-10">
          <Quote className="w-16 h-16 text-red-600 mx-auto mb-10 opacity-30" />
          <h2 className="max-w-4xl mx-auto text-2xl md:text-4xl font-bold text-white tracking-tight leading-snug italic mb-12">
            &quot;Chúng tôi không xem việc cho thuê thiết bị là một giao dịch
            thương mại. Chúng tôi xem đó là sự đồng hành trong hành trình kiến
            tạo những tác phẩm nghệ thuật xuất chúng.&quot;
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-600 mb-4 shadow-xl">
              <Image
                src="https://i.pravatar.cc/150?u=admin"
                alt="Founder"
                width={64}
                height={64}
              />
            </div>
            <p className="text-white font-bold text-lg">Admin LensHub</p>
            <p className="text-red-500 text-xs font-black uppercase tracking-widest mt-1">
              Founder of Studio Visuals
            </p>
          </div>
        </div>
      </section>

      {/* Support & Contact - Final Section */}
      <section id="support-form" className="py-24 bg-white relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-100 -z-10" />
        <div className="container px-4 mx-auto">
          <div className="max-w-[1400px] mx-auto bg-white border border-zinc-100 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-zinc-200/50 flex flex-col lg:flex-row gap-20">
            {/* Left: Contact Details */}
            <div className="lg:w-1/3 space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-1 bg-red-600" />
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                    Connect with us
                  </span>
                </div>
                <h2 className="text-[36px] md:text-[42px] font-black text-zinc-950 tracking-tighter leading-tight">
                  Chúng tôi luôn <br />
                  <span className="text-zinc-400">lắng nghe bạn.</span>
                </h2>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  Đội ngũ kỹ thuật và tư vấn của Studio Visuals luôn sẵn sàng hỗ
                  trợ bạn thực hiện những dự án tuyệt vời nhất.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Phone,
                    label: "Hotline phản hồi",
                    value: "0909 123 456",
                  },
                  {
                    icon: Mail,
                    label: "Email hỗ trợ",
                    value: "support@studiovisuals.vn",
                  },
                  {
                    icon: MapPin,
                    label: "Địa chỉ Studio",
                    value: "Số 1, Võ Văn Ngân, TP. Thủ Đức",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300">
                      <item.icon className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">
                        {item.label}
                      </p>
                      <p className="text-[15px] font-bold text-zinc-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex gap-4">
                {/* Social Buttons placeholders */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 cursor-pointer transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-zinc-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Modern Form */}
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                      Họ và tên nghệ sĩ
                    </label>
                    <Input
                      required
                      placeholder="Nguyễn Văn A"
                      className="h-12 bg-white border border-black/5 rounded-xl px-5 font-semibold text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                      Email liên hệ
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="email@example.com"
                      className="h-12 bg-white border border-black/5 rounded-xl px-5 font-semibold text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                      Số điện thoại
                    </label>
                    <Input
                      required
                      placeholder="09xx xxx xxx"
                      className="h-12 bg-white border border-black/5 rounded-xl px-5 font-semibold text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                      Vấn đề cần hỗ trợ
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          subject: val as SupportSubject,
                        })
                      }
                    >
                      <SelectTrigger className="w-full !h-12 !bg-white !border-black/5 rounded-xl px-5 font-semibold text-[15px] focus:!border-red-600/30 transition-all duration-200 text-left shadow-dash-card outline-none">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-100 shadow-dash-overlay bg-white p-1 z-[100]">
                        {SUBJECT_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-colors"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Mô tả chi tiết
                  </label>
                  <Textarea
                    required
                    placeholder="Hãy cho chúng tôi biết dự án của bạn cần hỗ trợ những gì..."
                    className="min-h-[160px] bg-zinc-50/50 border-none rounded-xl px-6 py-5 font-bold text-zinc-950 placeholder:text-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 transition-all shadow-sm resize-none outline-none"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-16 rounded-xl bg-zinc-950 text-white font-black tracking-[0.2em] hover:bg-zinc-800 hover:text-white transition-all shadow-2xl shadow-zinc-200 active:scale-[0.98] border-none"
                >
                  {isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi yêu cầu...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send className="w-4 h-4" />
                      Gửi yêu cầu ngay
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final Brand Trust Bar */}
      <section className="py-20 bg-white border-t border-zinc-100">
        <div className="container px-4 mx-auto">
          <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em] mb-12">
            Authorized Dealer & Professional Partner
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-20 grayscale">
            {["CANON", "SONY", "NIKON", "RED", "ARRI", "BLACKMAGIC"].map(
              (brand) => (
                <span
                  key={brand}
                  className="text-2xl font-black text-zinc-950 tracking-tighter"
                >
                  {brand}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
    <Footer />
  </>
  );
}
