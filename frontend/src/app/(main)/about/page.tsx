"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  History,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Target,
  Users,
  Video,
} from "lucide-react";
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
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SUBJECT_OPTIONS = [
  { value: SupportSubject.PRODUCT_INQUIRY, label: "Thông tin sản phẩm" },
  { value: SupportSubject.ORDER_ISSUE, label: "Vấn đề đơn hàng" },
  { value: SupportSubject.PAYMENT_ISSUE, label: "Vấn đề thanh toán" },
  { value: SupportSubject.TECHNICAL_SUPPORT, label: "Hỗ trợ kỹ thuật" },
  { value: SupportSubject.OTHER, label: "Vấn đề khác" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const values = [
  {
    icon: Target,
    title: "Tầm nhìn rõ ràng",
    description:
      "Trở thành hệ sinh thái thiết bị hình ảnh chuyên nghiệp, dễ tiếp cận và đáng tin cậy tại Việt Nam.",
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?q=80&w=1600&auto=format&fit=crop",
  },
  {
    icon: Heart,
    title: "Đồng hành thực tế",
    description:
      "Giúp nhà sáng tạo lựa chọn đúng thiết bị và nhận hỗ trợ trong suốt quá trình sử dụng.",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop",
  },
  {
    icon: ShieldCheck,
    title: "Minh bạch và an toàn",
    description:
      "Thông tin thiết bị, chi phí, tiền cọc và trạng thái đơn hàng luôn được trình bày rõ ràng.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  },
];

const aboutStats = [
  { label: "Năm hoạt động", value: "10+", icon: Clock },
  { label: "Thiết bị và phụ kiện", value: "2.500+", icon: Camera },
  { label: "Dự án đã phục vụ", value: "18.000+", icon: Video },
  { label: "Đối tác đồng hành", value: "50+", icon: Award },
];

const milestones = [
  {
    year: "2016",
    title: "Bắt đầu",
    description: "Khởi đầu từ một studio nhỏ với 10 máy ảnh Canon và Nikon.",
  },
  {
    year: "2018",
    title: "Mở rộng cinema",
    description: "Bổ sung hệ thống máy quay RED, ARRI và ống kính chuyên dụng.",
  },
  {
    year: "2021",
    title: "Số hóa dịch vụ",
    description: "Ra mắt nền tảng đặt thuê và quản lý đơn hàng trực tuyến.",
  },
  {
    year: "2024",
    title: "Hoàn thiện hệ sinh thái",
    description:
      "Kết hợp mua bán, cho thuê, eKYC và thanh toán trên một nền tảng.",
  },
];

const contactItems = [
  {
    icon: Phone,
    label: "Hotline hỗ trợ",
    value: "037 6600 545",
    href: "tel:0376600545",
  },
  {
    icon: Mail,
    label: "Email liên hệ",
    value: "adminlenshub@gmail.com",
    href: "mailto:adminlenshub@gmail.com",
  },
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "Số 1, Võ Văn Ngân, TP. Thủ Đức",
  },
];

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SupportSubject.OTHER,
    message: "",
  });

  const { mutate: submitTicket, isPending } = useSubmitTicket();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
        const message = (
          error as { response?: { data?: { message?: string } } }
        )?.response?.data?.message;
        toast.error(message || "Đã có lỗi xảy ra, vui lòng thử lại sau.");
      },
    });
  };

  const scrollToStory = () => {
    document
      .getElementById("our-story")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSupport = () => {
    document
      .getElementById("support-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white selection:bg-red-100">
        <section className="border-b border-zinc-200 bg-zinc-50/70">
          <div className="container mx-auto grid min-h-[680px] max-w-[1320px] items-center gap-10 px-4 py-14 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-xl"
            >
              <motion.div
                variants={itemVariants}
                className="mb-5 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-normal text-red-700"
              >
                <Camera className="h-3.5 w-3.5" />
                Câu chuyện Digital Rental
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mb-5 text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl"
              >
                Giúp ý tưởng lớn
                <span className="block text-red-600">
                  tiếp cận thiết bị tốt.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mb-8 max-w-lg text-base font-normal leading-7 text-zinc-500 md:text-lg"
              >
                Chúng tôi xây dựng một nền tảng mua và thuê thiết bị hình ảnh
                minh bạch, dễ sử dụng, giúp nhà sáng tạo tập trung vào dự án
                thay vì lo lắng về công cụ.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <button
                  type="button"
                  onClick={scrollToStory}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  <span style={{ color: "#ffffff" }}>Tìm hiểu câu chuyện</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollToSupport}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
                >
                  <span style={{ color: "#27272a" }}>
                    Liên hệ với chúng tôi
                  </span>
                </button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-normal text-zinc-500"
              >
                {[
                  "Hoạt động từ năm 2016",
                  "12.000+ khách hàng",
                  "2.500+ thiết bị",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1800&auto=format&fit=crop"
                  alt="Đội ngũ chuẩn bị thiết bị hình ảnh"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/50 bg-white/90 p-4 backdrop-blur-md">
                <p className="text-sm font-medium text-zinc-900">
                  Thiết bị được chuẩn bị trước mỗi dự án
                </p>
                <p className="mt-1 text-xs font-normal text-zinc-500">
                  Kiểm tra ngoại quan, chức năng và phụ kiện trước khi bàn giao
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-zinc-200 bg-white py-8">
          <div className="container mx-auto grid max-w-[1320px] grid-cols-2 gap-3 px-4 md:px-6 lg:grid-cols-4 lg:px-8">
            {aboutStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-red-600">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-zinc-950">
                    {stat.value}
                  </p>
                  <p className="text-xs font-normal text-zinc-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-red-600">
                  Điều chúng tôi theo đuổi
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  Một nền tảng được xây dựng từ trải nghiệm thật
                </h2>
              </div>
              <p className="max-w-md text-sm font-normal leading-6 text-zinc-500">
                Mọi quyết định về sản phẩm và quy trình đều bắt đầu từ nhu cầu
                thực tế của nhà sáng tạo và đội ngũ sản xuất.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {values.map((value, index) => (
                <motion.article
                  key={value.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group overflow-hidden rounded-xl border border-zinc-200 bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-red-600">
                      <value.icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-950">
                      {value.title}
                    </h3>
                    <p className="mt-2 min-h-16 text-sm font-normal leading-6 text-zinc-500">
                      {value.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="our-story" className="bg-white py-16 md:py-20">
          <div className="container mx-auto grid max-w-[1320px] items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:px-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200">
              <Image
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1800&auto=format&fit=crop"
                alt="Máy ảnh tại Digital Rental"
                fill
                className="object-cover"
              />
            </div>

            <div className="lg:pl-6">
              <p className="mb-2 text-sm font-medium text-red-600">
                Hành trình của chúng tôi
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-950">
                Từ một studio nhỏ đến nền tảng thiết bị toàn diện.
              </h2>
              <div className="mt-5 space-y-4 text-sm font-normal leading-6 text-zinc-500">
                <p>
                  Digital Rental bắt đầu từ trải nghiệm rất thực tế của một nhóm
                  nhiếp ảnh gia trẻ: thiết bị chuyên nghiệp có chi phí cao,
                  trong khi mỗi dự án lại cần một cấu hình khác nhau.
                </p>
                <p>
                  Chúng tôi xây dựng dịch vụ cho thuê để giúp nhà sáng tạo tiếp
                  cận đúng công cụ vào đúng thời điểm. Sau đó, nền tảng được mở
                  rộng với mua bán thiết bị, quản lý tồn kho, eKYC và thanh toán
                  trực tuyến.
                </p>
                <p>
                  Mục tiêu vẫn không thay đổi: giảm bớt rào cản về thiết bị và
                  mang lại một quy trình đáng tin cậy cho cả khách hàng cá nhân
                  lẫn đội ngũ sản xuất chuyên nghiệp.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Thiết bị được kiểm tra trước khi bàn giao",
                  "Chi phí và trạng thái đơn hàng minh bạch",
                  "Hỗ trợ kỹ thuật trong quá trình sử dụng",
                  "Tích hợp eKYC và thanh toán an toàn",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-2.5 rounded-xl bg-zinc-50 p-3.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm font-normal leading-5 text-zinc-600">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-red-600">
                  Những cột mốc chính
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  Phát triển từng bước, theo nhu cầu thực tế.
                </h2>
              </div>
              <p className="max-w-md text-sm font-normal leading-6 text-zinc-500">
                Mỗi giai đoạn là một lần hoàn thiện thêm danh mục thiết bị và
                trải nghiệm của người dùng.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {milestones.map((milestone) => (
                <article
                  key={milestone.year}
                  className="rounded-xl border border-zinc-200 bg-white p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <History className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-zinc-400">
                      {milestone.year}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-zinc-950">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-6 text-zinc-500">
                    {milestone.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="grid items-center gap-8 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-[1fr_auto] md:p-10">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-medium text-red-600">
                  Cách chúng tôi làm việc
                </p>
                <p className="text-xl font-medium leading-8 text-zinc-900 md:text-2xl">
                  “Một giao dịch tốt không kết thúc khi bàn giao thiết bị. Nó
                  kết thúc khi khách hàng hoàn thành dự án một cách thuận lợi.”
                </p>
                <p className="mt-5 text-sm font-normal text-zinc-500">
                  Đội ngũ Digital Rental
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 p-4">
                  <Clock className="mb-3 h-5 w-5 text-red-600" />
                  <p className="text-sm font-medium text-zinc-900">
                    Hỗ trợ nhanh
                  </p>
                  <p className="mt-1 text-xs font-normal text-zinc-500">
                    Phản hồi trong giờ làm việc
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4">
                  <Users className="mb-3 h-5 w-5 text-red-600" />
                  <p className="text-sm font-medium text-zinc-900">
                    Tư vấn thực tế
                  </p>
                  <p className="mt-1 text-xs font-normal text-zinc-500">
                    Dựa trên nhu cầu dự án
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="support-form"
          className="border-y border-zinc-200 bg-zinc-50/70 py-16 md:py-20"
        >
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="grid gap-8 rounded-xl border border-zinc-200 bg-white p-5 md:p-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
              <div>
                <p className="mb-2 text-sm font-medium text-red-600">
                  Liên hệ và hỗ trợ
                </p>
                <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-950">
                  Chúng tôi luôn lắng nghe bạn.
                </h2>
                <p className="mt-3 text-sm font-normal leading-6 text-zinc-500">
                  Gửi thông tin về sản phẩm, đơn hàng hoặc dự án cần tư vấn. Đội
                  ngũ Digital Rental sẽ phản hồi trong thời gian sớm nhất.
                </p>

                <div className="mt-7 space-y-3">
                  {contactItems.map((item) => {
                    const content = (
                      <>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-normal text-zinc-400">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-zinc-900">
                            {item.value}
                          </p>
                        </div>
                      </>
                    );

                    return item.href ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 transition-colors hover:bg-zinc-50"
                      >
                        {content}
                      </a>
                    ) : (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3"
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                      Họ và tên
                    </label>
                    <Input
                      required
                      placeholder="Nguyễn Văn A"
                      className="h-10 rounded-xl border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({ ...formData, name: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                      Email liên hệ
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="email@example.com"
                      className="h-10 rounded-xl border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData({ ...formData, email: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                      Số điện thoại
                    </label>
                    <Input
                      required
                      placeholder="09xx xxx xxx"
                      className="h-10 rounded-xl border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData({ ...formData, phone: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                      Vấn đề cần hỗ trợ
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          subject: value as SupportSubject,
                        })
                      }
                    >
                      <SelectTrigger className="!h-10 w-full rounded-xl !border-zinc-200 !bg-white px-3 text-sm font-normal text-zinc-900 shadow-none !outline-none !ring-0 focus:!border-zinc-400">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent className="z-[100] rounded-xl border-zinc-200 bg-white p-1 shadow-lg">
                        {SUBJECT_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-normal text-zinc-900 focus:bg-zinc-100 focus:text-zinc-950"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-normal text-zinc-600">
                    Mô tả chi tiết
                  </label>
                  <Textarea
                    required
                    placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ những gì..."
                    className="min-h-[120px] resize-none rounded-xl border-zinc-200 bg-white px-3 py-3 text-sm font-normal text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-0"
                    value={formData.message}
                    onChange={(event) =>
                      setFormData({ ...formData, message: event.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span style={{ color: "#ffffff" }}>
                        Đang gửi yêu cầu...
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span style={{ color: "#ffffff" }}>Gửi yêu cầu</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-200 bg-white py-12">
          <div className="container mx-auto max-w-[1320px] px-4 text-center md:px-6 lg:px-8">
            <p className="mb-7 text-xs font-normal text-zinc-500">
              Thiết bị từ các thương hiệu được tin dùng
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-xl font-semibold tracking-tight text-zinc-400 md:gap-x-16">
              {["Canon", "Sony", "Nikon", "RED", "ARRI", "Blackmagic"].map(
                (brand) => (
                  <span key={brand}>{brand}</span>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-xl bg-zinc-950 p-7 md:p-12">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
              <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <p className="mb-3 text-sm font-normal text-zinc-400">
                    Đồng hành cùng Digital Rental
                  </p>
                  <h2
                    className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
                    style={{ color: "#ffffff" }}
                  >
                    Có một dự án cần tư vấn thiết bị?
                  </h2>
                  <p className="mt-4 text-sm font-normal leading-6 text-zinc-400">
                    Hãy chia sẻ nhu cầu của bạn, đội ngũ của chúng tôi sẽ hỗ trợ
                    chọn cấu hình phù hợp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={scrollToSupport}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
                >
                  <span style={{ color: "#09090b" }}>Gửi yêu cầu tư vấn</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
