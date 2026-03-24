"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Camera, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Truck, 
  Sparkles,
  Zap,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative h-[90svh] w-full flex items-center justify-center overflow-hidden border-b">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero.png"
              alt="Professional Photography Gear"
              fill
              className="object-cover object-center opacity-85 brightness-[0.7] dark:brightness-[0.4]"
              priority
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent opacity-60" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-3xl"
            >
              <motion.div variants={itemVariants}>
                <Badge variant="secondary" className="mb-6 px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-2 inline" />
                  New Sony Alpha 1 II Now Available
                </Badge>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants} 
                className="text-5xl md:text-7xl font-bold tracking-tight text-white dark:text-foreground mb-6"
              >
                Capture Your Vision <br />
                <span className="text-primary italic font-serif">Without Compromise</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-zinc-100/90 dark:text-muted-foreground mb-10 leading-relaxed max-w-2xl"
              >
                Rent or buy the latest professional cameras, lenses, and lighting equipment. 
                Expert gear for every shot, delivered to your doorstep.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full px-8 text-lg h-14 group">
                  Explore Rentals
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 text-lg h-14 bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 transition-all duration-300">
                  Shop New Gear
                </Button>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-12 flex items-center gap-6 text-zinc-300">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      <Image 
                        src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                        alt="User" 
                        width={40} 
                        height={40} 
                      />
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    +2K
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider">Trusted by 2,000+ Pros</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">World-Class Equipment</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Discover our curated selection of premium gear for every photographer and cinematographer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Cameras", icon: <Camera />, count: "120+ Models", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop" },
                { title: "Lenses", icon: <Zap />, count: "450+ Options", image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=2000&auto=format&fit=crop" },
                { title: "Lighting", icon: <Sparkles />, count: "80+ Kits", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop" },
              ].map((cat, idx) => (
                <motion.div
                  key={cat.title}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="overflow-hidden border-none group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-80 overflow-hidden">
                      <Image 
                        src={cat.image} 
                        alt={cat.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-primary/20 backdrop-blur-md p-2 rounded-lg text-primary">
                            {idx === 0 ? <Camera className="h-5 w-5" /> : idx === 1 ? <Zap className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                          </div>
                          <h3 className="text-2xl font-bold">{cat.title}</h3>
                        </div>
                        <p className="text-zinc-300 text-sm">{cat.count}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50 border-y relative">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { icon: <ShieldCheck className="h-8 w-8 text-primary" />, title: "Fully Insured", desc: "Every rental comes with optional comprehensive damage protection." },
                { icon: <Clock className="h-8 w-8 text-primary" />, title: "24/7 Support", desc: "Need help on set? Our technical experts are available around the clock." },
                { icon: <Truck className="h-8 w-8 text-primary" />, title: "Flash Delivery", desc: "Same-day delivery available in major cities for last-minute needs." },
                { icon: <Star className="h-8 w-8 text-primary" />, title: "Pro Verified", desc: "All equipment is manually cleaned and tested before every single rental." },
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="bg-background w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="bg-zinc-950 text-white rounded-[2rem] p-12 md:p-20 relative overflow-hidden border border-white/10 shadow-3xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to start your <br /> next project?</h2>
                <p className="text-zinc-400 text-xl mb-10 leading-relaxed">
                  Join 2,000+ professionals who trust LensHub for their photography and cinematography gear.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-primary hover:bg-primary/90">
                    Get Started Now
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg border-white/20 bg-transparent hover:bg-white/5 text-white transition-all">
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
