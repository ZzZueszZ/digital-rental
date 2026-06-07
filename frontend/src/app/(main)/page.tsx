"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Star,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductListSection } from "@/components/home/ProductListSection";

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

const stats = [
  { label: "Thiết bị sẵn sàng", value: "2.500+", icon: Camera },
  { label: "Dự án đã phục vụ", value: "18.000+", icon: Video },
  { label: "Khách hàng tin dùng", value: "12.000+", icon: Users },
  { label: "Đối tác thương hiệu", value: "45+", icon: Award },
];

const categories = [
  {
    title: "Máy quay cinema",
    description: "RED, ARRI và Sony Venice cho các đoàn phim chuyên nghiệp.",
    image:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Ống kính chuyên dụng",
    description: "Prime, zoom và anamorphic cho nhiều phong cách hình ảnh.",
    image:
      "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Ánh sáng và phụ kiện",
    description: "Hệ thống ánh sáng, grip và phụ kiện sẵn sàng cho set quay.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
  },
];

const steps = [
  {
    icon: Layers,
    title: "Chọn thiết bị",
    description: "Tìm sản phẩm phù hợp với nhu cầu mua hoặc lịch quay.",
  },
  {
    icon: Clock,
    title: "Chọn thời gian",
    description: "Kiểm tra lịch trống và xác nhận thời gian nhận, trả máy.",
  },
  {
    icon: ShieldCheck,
    title: "Xác minh và thanh toán",
    description: "Hoàn tất eKYC, tiền thuê và khoản cọc theo hướng dẫn.",
  },
  {
    icon: Zap,
    title: "Nhận thiết bị",
    description: "Thiết bị được kiểm tra kỹ trước khi bàn giao tại cửa hàng.",
  },
];

const commitments = [
  "Kiểm định thiết bị trước mỗi lần bàn giao",
  "Hỗ trợ kỹ thuật trong suốt thời gian sử dụng",
  "Chính sách bảo hiểm và tiền cọc minh bạch",
  "Danh mục thiết bị từ các thương hiệu uy tín",
];

export default function Home() {
  const scrollToProducts = () => {
    document
      .getElementById("product-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-zinc-950 selection:bg-red-100">
      <Navbar />

      <main className="flex-1">
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
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                Thiết bị hình ảnh chuyên nghiệp
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mb-5 text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl"
              >
                Thiết bị tốt cho
                <span className="block text-red-600">những khung hình tốt.</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mb-8 max-w-lg text-base font-normal leading-7 text-zinc-500 md:text-lg"
              >
                Mua và thuê máy ảnh, ống kính, ánh sáng cùng phụ kiện chính
                hãng. Quy trình rõ ràng, thiết bị được kiểm tra kỹ và hỗ trợ
                xuyên suốt dự án.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Button
                  onClick={scrollToProducts}
                  className="h-11 rounded-xl bg-zinc-950 px-6 text-sm font-medium text-white shadow-none hover:bg-zinc-800"
                >
                  Xem thiết bị
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    document
                      .getElementById("rental-process")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-11 rounded-xl border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-800 shadow-none hover:bg-zinc-50"
                >
                  Xem quy trình thuê
                </Button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-normal text-zinc-500"
              >
                {["Thiết bị chính hãng", "Hỗ trợ kỹ thuật", "Thanh toán an toàn"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {item}
                    </span>
                  ),
                )}
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
                  src="/modern_photography_hero.png"
                  alt="Thiết bị máy ảnh chuyên nghiệp"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/25 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/50 bg-white/90 p-4 backdrop-blur-md">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Sẵn sàng cho dự án tiếp theo
                  </p>
                  <p className="mt-1 text-xs font-normal text-zinc-500">
                    Kiểm tra lịch trống trực tiếp trên từng sản phẩm
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-zinc-200 bg-white py-8">
          <div className="container mx-auto grid max-w-[1320px] grid-cols-2 gap-3 px-4 md:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
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
                  <p className="text-xs font-normal text-zinc-500">{stat.label}</p>
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
                  Danh mục nổi bật
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  Chọn đúng thiết bị cho dự án
                </h2>
              </div>
              <p className="max-w-md text-sm font-normal leading-6 text-zinc-500">
                Danh mục được sắp xếp theo nhu cầu tác nghiệp để bạn dễ so sánh
                và lên bộ thiết bị phù hợp.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {categories.map((category, index) => (
                <motion.article
                  key={category.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group overflow-hidden rounded-xl border border-zinc-200 bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-zinc-950">
                      {category.title}
                    </h3>
                    <p className="mt-2 min-h-10 text-sm font-normal leading-5 text-zinc-500">
                      {category.description}
                    </p>
                    <button
                      onClick={scrollToProducts}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      Xem sản phẩm <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <ProductListSection />

        <section
          id="rental-process"
          className="border-y border-zinc-200 bg-zinc-50/70 py-16 md:py-20"
        >
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="mb-10 max-w-xl">
              <p className="mb-2 text-sm font-medium text-red-600">
                Quy trình thuê
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                Bốn bước, thông tin rõ ràng
              </h2>
              <p className="mt-3 text-sm font-normal leading-6 text-zinc-500">
                Từ chọn máy đến nhận thiết bị, mọi chi phí và trạng thái đều
                được hiển thị trong tài khoản của bạn.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-zinc-200 bg-white p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-800">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-normal text-zinc-400">
                      Bước {index + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-zinc-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-6 text-zinc-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto grid max-w-[1320px] items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:px-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200">
              <Image
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1800&auto=format&fit=crop"
                alt="Kỹ thuật viên chuẩn bị thiết bị"
                fill
                className="object-cover"
              />
            </div>

            <div className="lg:pl-8">
              <p className="mb-2 text-sm font-medium text-red-600">
                Đồng hành cùng dự án
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-950">
                Không chỉ giao máy, chúng tôi giúp bạn sẵn sàng tác nghiệp.
              </h2>
              <p className="mt-4 text-sm font-normal leading-6 text-zinc-500">
                Mỗi thiết bị đều được kiểm tra trước khi bàn giao. Đội ngũ hỗ
                trợ luôn sẵn sàng tư vấn cấu hình, vận hành và xử lý vấn đề
                trong quá trình sử dụng.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {commitments.map((commitment) => (
                  <div
                    key={commitment}
                    className="flex gap-2.5 rounded-xl bg-zinc-50 p-3.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm font-normal leading-5 text-zinc-600">
                      {commitment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="grid items-center gap-8 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-[1fr_auto] md:p-10">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xl font-medium leading-8 text-zinc-900 md:text-2xl">
                  “Thiết bị được chuẩn bị kỹ, quy trình nhận máy nhanh và đội kỹ
                  thuật hỗ trợ rất sát trong suốt buổi quay.”
                </p>
                <p className="mt-5 text-sm font-normal text-zinc-500">
                  Trần Việt Anh, Đạo diễn hình ảnh tại V-Studio
                </p>
              </div>
              <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-zinc-200 md:h-32 md:w-32">
                <Image
                  src="https://i.pravatar.cc/300?u=4"
                  alt="Trần Việt Anh"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white py-12">
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

        <section className="bg-zinc-50/70 py-16 md:py-20">
          <div className="container mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-xl bg-zinc-950 p-7 text-white md:p-12">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
              <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <p className="mb-3 text-sm font-normal text-zinc-400">
                    Bắt đầu dự án mới
                  </p>
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                    Tìm bộ thiết bị phù hợp ngay hôm nay.
                  </h2>
                  <p className="mt-4 text-sm font-normal leading-6 text-zinc-400">
                    Xem giá mua, giá thuê và lịch trống trực tiếp trên từng sản
                    phẩm.
                  </p>
                </div>
                <Button
                  onClick={scrollToProducts}
                  className="h-11 shrink-0 rounded-xl bg-white px-6 text-sm font-medium text-zinc-950 shadow-none hover:bg-zinc-100"
                >
                  Khám phá thiết bị
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
