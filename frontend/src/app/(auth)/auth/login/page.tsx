"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHero } from "@/components/auth/AuthHero";
import Link from "next/link";
import Routers from "@/constants/routers";
import { ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-1000 bg-zinc-50">
      {/* Top Navigation */}
      <div className="px-8 py-6 flex justify-between items-center relative z-10">
        <Link href={Routers.HOME}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-lg h-10 w-10 border-black/5 bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-red-600 shadow-dash-card transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg h-10 w-10 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <main className="flex-1 flex items-center px-8 pb-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <LoginHero />
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
