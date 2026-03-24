import Link from "next/link";
import { Camera, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
              <div className="bg-primary p-1.5 rounded-lg">
                <Camera className="h-6 w-6 text-primary-foreground" />
              </div>
              <span>Lens<span className="text-muted-foreground font-normal">Hub</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium photography equipment rentals and sales. Capture your vision with the best gear in the industry.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Rentals</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Cameras</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Lenses</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Lighting</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">New Releases</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Used Gear</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Trade-in</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Gift Cards</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Rental Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2024 LensHub Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
