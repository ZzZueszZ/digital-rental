"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegisterHero } from "@/components/auth/AuthHero";
import Link from "next/link";
import Routers from "@/constants/routers";
import { ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-1000 bg-zinc-50">
      {/* Top Navigation */}
      <div className="p-6 flex justify-between items-center relative z-10">
        <Link href={Routers.LOGIN}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 border-zinc-200 bg-white text-zinc-900 focus-visible:ring-[#ff8c5a] shadow-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 text-zinc-900"
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </div>

      <main className="flex-1 flex items-center px-4 pb-12">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <RegisterHero />
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
