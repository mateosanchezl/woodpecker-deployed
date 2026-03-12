"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Target,
  Trophy,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Users,
  Repeat,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { Chessboard } from "react-chessboard";
import { FeaturesSection } from "@/components/landing/features-section";
import { LandingNavbar } from "@/components/landing/navbar";

type LandingPageProps = {
  completedPuzzlesCount: number;
};

const formatLargeNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage({
  completedPuzzlesCount,
}: LandingPageProps) {
  const completedPuzzlesDisplay = formatLargeNumber(completedPuzzlesCount);

  const stats = [
    { label: "Puzzles Available", value: "1.5M+", icon: Target },
    { label: "Avg. Rating Gain", value: "+150", icon: TrendingUp },
    { label: "Completion Rate", value: "94%", icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-32 lg:py-40 overflow-hidden">
          {/* Playful Dotted Background */}
          <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] bg-size-[24px_24px] opacity-10" />
          
          {/* Soft Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-screen-2xl -z-10 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[100px] opacity-60" />
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-60" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <motion.div
                className="flex-1 text-center lg:text-left z-10"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-8 shadow-sm backdrop-blur-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>The Scientific Way to Master Chess</span>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] mb-8 text-foreground"
                >
                  Don&apos;t just solve. <br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 text-primary italic pr-4">Internalize.</span>
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-4 text-chart-2/80"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 5 Q 50 10 100 5"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium"
                >
                  Stop grinding random puzzles. Build pure tactical intuition by solving the <span className="text-foreground font-bold">same high-quality set</span> faster and faster until the patterns become instinct.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5"
                >
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-16 px-10 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1 font-bold"
                    >
                      Start Free Training
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-16 px-10 text-lg rounded-full border-2 hover:bg-primary/5 hover:text-primary transition-colors font-bold bg-background/50 backdrop-blur-sm"
                    >
                      How It Works
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-muted-foreground"
                >
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>No Credit Card</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>1.5M+ Puzzles</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Visual Element */}
              <motion.div
                className="flex-1 w-full max-w-lg lg:max-w-full relative"
                initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -right-4 md:-right-8 z-30 bg-background/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-border flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-chart-2/15 flex items-center justify-center text-chart-2">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Streak</div>
                    <div className="text-base font-bold text-foreground">14 Days</div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-4 md:-left-10 z-30 bg-background/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-border flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                    <Repeat className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Cycle 3</div>
                    <div className="text-base font-bold text-foreground">50% Faster</div>
                  </div>
                </motion.div>

                <div className="relative rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl bg-card p-6 md:p-10 flex flex-col justify-center">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />

                  {/* Chessboard Layer */}
                  <div className="relative z-20 mb-8">
                    <div className="relative w-full max-w-[400px] mx-auto">
                      <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-60" />
                      
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50 bg-background/50 p-2">
                        <Chessboard
                          options={{
                            position: "6k1/p4pp1/2p1pb2/1q5p/N1Q5/1P2P1P1/P2r1P1P/2R3K1 w - - 1 26",
                            allowDragging: false,
                            darkSquareStyle: { backgroundColor: "oklch(0.6 0.1 145)" },
                            lightSquareStyle: { backgroundColor: "oklch(0.96 0.03 145)" },
                            boardStyle: { borderRadius: "12px" },
                            squareStyles: {
                              c4: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
                              c1: { backgroundColor: "rgba(255, 255, 0, 0.3)" },
                            }
                          }}
                        />
                      </div>

                      {/* "White to move" indicator */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-background border border-border shadow-lg font-bold text-sm text-foreground flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white border border-gray-300 shadow-sm" />
                        White to move
                      </div>
                    </div>
                  </div>

                  {/* Clean Concept Indicator */}
                  <div className="relative z-10 bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm text-center">
                    <p className="text-lg font-bold text-foreground mb-3">The Woodpecker Cycle</p>
                    <div className="flex items-center justify-center gap-3 sm:gap-4 text-sm font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Target className="h-4 w-4 text-primary" /> Accuracy</span>
                      <ArrowRight className="h-4 w-4 opacity-30" />
                      <span className="flex items-center gap-1.5"><Repeat className="h-4 w-4 text-primary" /> Repetition</span>
                      <ArrowRight className="h-4 w-4 opacity-30" />
                      <span className="flex items-center gap-1.5 text-foreground"><Zap className="h-4 w-4 text-chart-2" /> Intuition</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Milestone & Stats Combined Section */}
        <section className="relative py-24 bg-card border-y border-border overflow-hidden">
          {/* Subtle background lines */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-foreground) 0, var(--color-foreground) 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center justify-center text-center mb-20">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 whileInView={{ opacity: 1, scale: 1 }} 
                 viewport={{ once: true }}
                 className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm font-bold text-primary mb-6"
               >
                 <Users className="h-5 w-5" />
                 Community Milestone
               </motion.div>
               <motion.h2 
                 initial={{ opacity: 0, y: 20 }} 
                 whileInView={{ opacity: 1, y: 0 }} 
                 viewport={{ once: true }}
                 className="text-6xl sm:text-8xl lg:text-[8rem] font-black tracking-tighter text-foreground mb-6"
               >
                 {completedPuzzlesDisplay}
               </motion.h2>
               <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
                 Puzzles completed and <span className="italic text-foreground">internalized</span> by Peck users.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-5xl mx-auto">
              {stats.map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="bg-background rounded-3xl p-8 border border-border shadow-sm text-center hover:shadow-md transition-shadow group"
                >
                  <div className="h-14 w-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <stat.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-4xl font-black tracking-tight mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base text-muted-foreground font-semibold">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />

        {/* Enhanced CTA Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] bg-foreground text-background p-10 sm:p-20 text-center shadow-2xl overflow-hidden mt-12 mb-12 lg:mb-20">
              {/* Playful abstract shapes in the CTA background */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary rounded-full blur-[80px] opacity-40 mix-blend-screen" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent rounded-full blur-[80px] opacity-40 mix-blend-screen" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="flex justify-center mb-8">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-background/10 p-2 backdrop-blur-sm border border-background/20 shadow-xl">
                    <Image
                      src="/pecklogoicon.png"
                      alt="Peck Logo"
                      fill
                      sizes="64px"
                      className="object-contain drop-shadow-md p-1"
                    />
                  </div>
                </div>
                <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight">
                  Ready to transform your <span className="text-primary italic">tactical vision?</span>
                </h2>
                <p className="text-background/80 text-xl sm:text-2xl mb-12 font-medium">
                  Join ambitious players who have switched from random puzzle solving to deliberate, scientific practice.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-16 px-10 text-lg font-bold shadow-xl rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all"
                    >
                      Start Free Training
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-full bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background"
                    >
                      Log In
                    </Button>
                  </Link>
                </div>
                <p className="mt-8 text-sm font-semibold text-background/50">
                  Free forever • No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-md transition-transform group-hover:scale-105">
                <Image
                  src="/pecklogoicon.png"
                  alt="Peck Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-black tracking-tighter">
                Peck
              </span>
            </Link>
            <div className="text-sm font-medium text-muted-foreground">
              © {new Date().getFullYear()} Peck. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
                { label: "FAQ", href: "/faq" },
                { label: "Blog", href: "/blog" },
                { label: "Method", href: "/woodpecker-method" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="mailto:support@peckchess.com"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
