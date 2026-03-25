"use client";

import Link from "next/link";
import { Camera, Search, User, ShoppingBag, Menu, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Routers from "@/constants/routers";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/5 select-none">
      <div className="container flex h-20 items-center justify-between px-6 md:px-12 max-w-[1600px] mx-auto">
        
        {/* Logo Section */}
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-all"
          >
            <div className="w-10 h-10 bg-[#ff8c5a] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
              <Camera className="h-5 w-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white uppercase font-heading leading-none">Studio</span>
              <span className="text-lg font-black tracking-tighter text-[#ff8c5a] uppercase font-heading leading-none">Visuals</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors data-[state=open]:text-white">
                    Thiết Bị
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-6 w-[700px] bg-[#0c0c0c] border border-white/5 rounded-[2rem] shadow-2xl flex gap-6">
                      <div className="flex-1 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                        <Zap className="w-8 h-8 text-[#ff8c5a] mb-4" />
                        <h4 className="text-xl font-black text-white uppercase font-heading mb-3">Kho Vũ Khí</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed mb-4 font-medium">
                          Khám phá các dòng máy ảnh và ống kính chuyên nghiệp nhất hiện nay.
                        </p>
                        <Button variant="outline" className="rounded-full border-white/10 text-white font-black uppercase text-[9px] tracking-widest px-6 h-10 hover:bg-[#ff8c5a] hover:text-black transition-all">Xem Tất Cả</Button>
                      </div>
                      <div className="flex-1 grid grid-cols-1 gap-2">
                        <Link href="/rentals" className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 transition-all">
                          <div>
                            <p className="text-white font-bold text-xs uppercase tracking-widest">Máy Ảnh</p>
                            <p className="text-zinc-500 text-[9px] font-bold uppercase mt-0.5">Mirrorless & Cinema</p>
                          </div>
                          <Sparkles className="w-3 h-3 text-[#ff8c5a] opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                        <Link href="/rentals" className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 transition-all">
                          <div>
                            <p className="text-white font-bold text-xs uppercase tracking-widest">Ống Kính</p>
                            <p className="text-zinc-500 text-[9px] font-bold uppercase mt-0.5">Prime & Zoom</p>
                          </div>
                          <Sparkles className="w-3 h-3 text-[#ff8c5a] opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                        <Link href="/rentals" className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 transition-all">
                          <div>
                            <p className="text-white font-bold text-xs uppercase tracking-widest">Ánh Sáng</p>
                            <p className="text-zinc-500 text-[9px] font-bold uppercase mt-0.5">Phòng Studio & Ngoại Cảnh</p>
                          </div>
                          <Sparkles className="w-3 h-3 text-[#ff8c5a] opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/inventory"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-transparent px-5 text-xs font-bold text-zinc-500 uppercase tracking-widest transition-all hover:text-white"
                  >
                    Sản Phẩm Mới
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/about"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-transparent px-5 text-xs font-bold text-zinc-500 uppercase tracking-widest transition-all hover:text-white"
                  >
                    Về Chúng Tôi
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-zinc-900/50 border border-white/5 rounded-full px-5 h-10 gap-3">
            <Search className="h-3.5 w-3.5 text-zinc-500" />
            <input 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-zinc-500 w-36"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Link href={Routers.LOGIN}>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-zinc-900 transition-all group">
                <User className="h-4 w-4 text-zinc-500 group-hover:text-white" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-xl hover:bg-zinc-900 transition-all group">
              <ShoppingBag className="h-4 w-4 text-zinc-500 group-hover:text-white" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff8c5a] text-[8px] font-black text-black">
                0
              </span>
            </Button>
            <Button className="hidden xl:flex ml-3 h-10 rounded-full px-6 bg-white text-black hover:bg-[#ff8c5a] font-black uppercase text-[9px] tracking-widest shadow-lg active:scale-95 transition-all">
              Đặt Thuê Ngay
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden w-10 h-10 rounded-xl bg-zinc-900">
              <Menu className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
