"use client";

import Link from "next/link";
import { Camera, Search, User, ShoppingBag, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-2xl tracking-tight"
          >
            <div className="bg-primary p-1.5 rounded-lg">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <span>
              Lens<span className="text-muted-foreground font-normal">Hub</span>
            </span>
          </Link>

          <div className="hidden md:ml-10 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Rentals</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <div className="row-span-3">
                        <NavigationMenuLink href="/">
                          <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                            <Camera className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Professional Gear
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Rent the latest mirrorless cameras, lenses, and
                              lighting equipment.
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                      <Link
                        href="/rent/cameras"
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        Cameras
                      </Link>
                      <Link
                        href="/rent/lenses"
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        Lenses
                      </Link>
                      <Link
                        href="/rent/lighting"
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        Lighting
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/shop"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Shop New
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/about"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Button className="hidden md:flex ml-2">Rent Goods</Button>
        </div>
      </div>
    </nav>
  );
}
