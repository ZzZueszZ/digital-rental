"use client";

import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyProfile } from "@/services/profile";
import { useMyAddresses } from "@/services/address";
import { useMyCart } from "@/services/cart";

export default function OverviewPage() {
  const router = useRouter();
  const { data: profileRes } = useMyProfile();
  const { data: addressesRes } = useMyAddresses();
  const { data: cartRes } = useMyCart();

  const profile = profileRes?.data;
  const addresses = addressesRes?.data || [];
  const cartItemsCount = cartRes?.data?.length || 0;

  const cards = [
    {
      icon: User,
      label: "Hồ sơ cá nhân",
      value: profile?.fullName || "Chưa cập nhật",
      description: "Thông tin tài khoản",
      href: "/profile/info",
    },
    {
      icon: MapPin,
      label: "Sổ địa chỉ",
      value: `${addresses.length} địa chỉ`,
      description: "Điểm giao nhận đã lưu",
      href: "/profile/address",
    },
    {
      icon: ShoppingCart,
      label: "Giỏ hàng",
      value: `${cartItemsCount} sản phẩm`,
      description: "Đang chờ thanh toán",
      href: "/profile/cart",
    },
    {
      icon: ShoppingBag,
      label: "Đơn hàng",
      value: "Xem lịch sử",
      description: "Giao dịch mua và thuê",
      href: "/profile/orders",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium text-red-600">
              Tài khoản của bạn
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Chào {profile?.fullName || "bạn"}.
            </h2>
            <p className="mt-3 text-sm font-normal leading-6 text-zinc-500">
              Quản lý thông tin cá nhân, địa chỉ, đơn hàng và hồ sơ xác minh tại
              một nơi.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/profile/info")}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <span style={{ color: "#ffffff" }}>Cập nhật hồ sơ</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/orders")}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => router.push(card.href)}
            className="group rounded-xl border border-zinc-200 bg-white p-5 text-left transition-colors hover:border-zinc-300"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-red-600">
                <card.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-zinc-600" />
            </div>
            <p className="text-xs font-normal text-zinc-500">{card.label}</p>
            <p className="mt-1 truncate text-lg font-medium text-zinc-950">
              {card.value}
            </p>
            <p className="mt-1 text-xs font-normal text-zinc-400">
              {card.description}
            </p>
          </button>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-zinc-950">
                Hoạt động gần đây
              </h3>
              <p className="mt-1 text-xs font-normal text-zinc-400">
                Các thay đổi và giao dịch mới nhất
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/profile/orders")}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Xem tất cả
            </button>
          </div>
          <div className="flex min-h-52 flex-col items-center justify-center rounded-xl bg-zinc-50 p-6 text-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-300">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-zinc-600">
              Chưa có hoạt động mới
            </p>
            <p className="mt-1 text-xs font-normal text-zinc-400">
              Đơn mua và lịch thuê sẽ xuất hiện tại đây.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium text-zinc-950">
            Hoàn thiện hồ sơ thuê
          </h3>
          <p className="mt-2 text-sm font-normal leading-6 text-zinc-500">
            Xác minh eKYC giúp quá trình đặt thuê và xét duyệt thiết bị nhanh
            hơn.
          </p>
          <div className="mt-5 space-y-2.5">
            {[
              "Thông tin cá nhân",
              "Giấy tờ định danh",
              "Xác thực khuôn mặt",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
                <span className="font-normal text-zinc-500">{item}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => router.push("/profile/ekyc")}
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <span style={{ color: "#ffffff" }}>Kiểm tra trạng thái eKYC</span>
          </button>
        </div>
      </section>
    </div>
  );
}
