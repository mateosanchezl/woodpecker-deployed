"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Target,
  Trophy,
  TrendingUp,
  Flame,
  Zap,
  CheckCircle2,
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
        {/* Radical Hero Redesign - Typographic & Maximalist */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-background overflow-hidden">
            {/* Massive background typography */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] pointer-events-none select-none flex flex-col leading-[0.8]">
              <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">PATTERN</span>
              <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">RECOGNITION</span>
            </div>

            {/* Glowing orbs */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-chart-2/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-accent/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              {/* Floating micro-elements around title */}
              <div className="relative w-full flex justify-center mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="inline-flex items-center gap-3 rounded-full bg-background/50 border border-primary/20 px-6 py-2.5 shadow-lg backdrop-blur-xl"
                >
                  <span className="flex h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
                  <span className="text-sm font-bold text-foreground uppercase tracking-widest">The Woodpecker Method</span>
                </motion.div>
                
                {/* Decorative floating chess piece abstractions */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -left-12 md:-left-24 top-0"
                >
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center -rotate-12">
                    <Target className="h-6 w-6 text-chart-2" />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="absolute -right-8 md:-right-20 top-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 shadow-lg flex items-center justify-center rotate-15 backdrop-blur-md">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                </motion.div>
              </div>

              {/* Massive Typographic Hero */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 mb-8"
              >
                <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black leading-[0.9] tracking-tighter text-foreground">
                  Rewire your <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-2 to-primary bg-300% animate-gradient">chess brain.</span>
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground font-medium max-w-3xl leading-relaxed mb-12"
              >
                Stop solving random puzzles. <span className="text-foreground font-bold">Internalize patterns</span> through scientific repetition until brilliant moves become instinct.
              </motion.p>

              {/* Action Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto z-30 relative"
              >
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-16 md:h-20 px-10 md:px-14 text-lg md:text-xl rounded-[2rem] bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:shadow-[0_0_60px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] font-black"
                  >
                    Start Free Training
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                
                <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground px-6 py-4 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/50">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-background flex items-center justify-center shadow-sm ${i === 1 ? 'bg-primary/20' : i === 2 ? 'bg-chart-2/20' : 'bg-accent/50'}`}>
                        {i === 1 && <Trophy className="w-4 h-4 text-primary" />}
                        {i === 2 && <Flame className="w-4 h-4 text-chart-2" />}
                        {i === 3 && <Target className="w-4 h-4 text-foreground" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-foreground">Join other players</span>
                    <span className="text-xs font-semibold opacity-70">Improving daily</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Abstract floating interactive "boards" */}
            <div className="mt-20 lg:mt-32 w-full max-w-6xl mx-auto relative h-[40vh] min-h-[300px] hidden md:block">
               {/* Left board */}
               <motion.div
                 initial={{ opacity: 0, y: 100, rotate: -20 }}
                 animate={{ opacity: 1, y: 0, rotate: -10 }}
                 transition={{ duration: 1.2, delay: 0.5, type: "spring" }}
                 className="absolute left-0 top-10 w-64 h-64 bg-card rounded-3xl border border-border/50 shadow-2xl p-3 overflow-hidden z-10"
               >
                 <div className="absolute inset-0 bg-primary/5" />
                 <Chessboard
                    options={{
                      position: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5",
                      allowDragging: false,
                      darkSquareStyle: { backgroundColor: "oklch(0.96 0.02 85)" },
                      lightSquareStyle: { backgroundColor: "transparent" },
                      boardStyle: { borderRadius: "1rem" },
                    }}
                  />
                  <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-border">
                    Italian Game
                  </div>
               </motion.div>

               {/* Center Main Board */}
               <motion.div
                 initial={{ opacity: 0, y: 150, scale: 0.8 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 transition={{ duration: 1.2, delay: 0.6, type: "spring", bounce: 0.4 }}
                 className="absolute left-1/2 -translate-x-1/2 -top-10 w-80 h-80 bg-background rounded-[2.5rem] border border-primary/20 shadow-[0_30px_60px_rgba(0,0,0,0.12)] p-4 overflow-hidden z-30"
               >
                 <div className="absolute -inset-10 bg-linear-to-br from-primary/10 to-transparent blur-2xl" />
                 <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner ring-1 ring-border">
                  <Chessboard
                      options={{
                        position: "6k1/p4pp1/2p1pb2/1q5p/N1Q5/1P2P1P1/P2r1P1P/2R3K1 w - - 1 26",
                        allowDragging: false,
                        darkSquareStyle: { backgroundColor: "oklch(0.6 0.1 145)" },
                        lightSquareStyle: { backgroundColor: "oklch(0.96 0.03 145)" },
                        squareStyles: {
                          c4: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
                          c1: { backgroundColor: "rgba(255, 255, 0, 0.3)" },
                        }
                      }}
                    />
                 </div>
                 <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-chart-2 text-white font-black px-4 py-2 rounded-l-xl shadow-lg rotate-90 origin-right">
                    CYCLE 1
                 </div>
               </motion.div>

               {/* Right board */}
               <motion.div
                 initial={{ opacity: 0, y: 100, rotate: 20 }}
                 animate={{ opacity: 1, y: 0, rotate: 12 }}
                 transition={{ duration: 1.2, delay: 0.7, type: "spring" }}
                 className="absolute right-0 top-4 w-72 h-72 bg-card rounded-[2rem] border border-border/50 shadow-2xl p-4 overflow-hidden z-20"
               >
                 <div className="absolute inset-0 bg-accent/5" />
                 <Chessboard
                    options={{
                      position: "r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
                      allowDragging: false,
                      darkSquareStyle: { backgroundColor: "oklch(0.92 0.06 145)" },
                      lightSquareStyle: { backgroundColor: "transparent" },
                      boardStyle: { borderRadius: "1.25rem" },
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur w-10 h-10 flex items-center justify-center rounded-full text-xs font-black shadow-sm border border-border text-primary">
                    1.2s
                  </div>
               </motion.div>
            </div>
          </div>
        </section>

        {/* Milestone & Stats - Maximalist Redesign */}
        <section className="relative py-32 bg-foreground text-background overflow-hidden">
          {/* Brutalist moving ticker tape background */}
          <div className="absolute top-0 left-0 w-full flex overflow-hidden opacity-5 pointer-events-none -translate-y-1/2">
            <motion.div
              animate={{ x: [0, -1036] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="flex whitespace-nowrap text-[12rem] font-black"
            >
              SOLVE FASTER • MASTER PATTERNS • SOLVE FASTER • MASTER PATTERNS • 
            </motion.div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="flex-1">
                <motion.div 
                 initial={{ opacity: 0, x: -50 }} 
                 whileInView={{ opacity: 1, x: 0 }} 
                 viewport={{ once: true, margin: "-100px" }}
                 className="mb-8"
                >
                  <h2 className="text-sm font-black tracking-widest text-primary uppercase mb-6 flex items-center gap-4">
                    <span className="w-12 h-0.5 bg-primary"></span>
                    The Evidence
                  </h2>
                  <div className="text-[5rem] sm:text-[7rem] lg:text-[9rem] font-black tracking-tighter leading-[0.8] mb-6">
                    {completedPuzzlesDisplay}
                  </div>
                  <p className="text-2xl sm:text-4xl font-medium opacity-80 leading-tight">
                    Puzzles internalized by the <br /> <span className="italic text-primary">Peck community.</span>
                  </p>
                </motion.div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 w-full">
                {stats.map((stat, i) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                    key={i}
                    className="bg-background/10 backdrop-blur-md rounded-[2.5rem] p-8 lg:p-12 border border-background/20 relative overflow-hidden group hover:bg-background/20 transition-colors"
                  >
                    <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700">
                      <stat.icon className="h-48 w-48" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-5xl lg:text-7xl font-black tracking-tight mb-4 text-primary">
                        {stat.value}
                      </div>
                      <div className="text-lg lg:text-xl font-bold uppercase tracking-widest opacity-70">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />

        {/* Enhanced CTA Section - Neon Brutalism */}
        <section className="py-32 relative overflow-hidden bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full rounded-[3rem] bg-card border-2 border-border shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              {/* Graphic element */}
              <div className="absolute right-0 bottom-0 w-full md:w-1/2 h-full opacity-30 md:opacity-100 pointer-events-none">
                <div className="absolute right-[-10%] bottom-[-20%] w-[80%] aspect-square bg-linear-to-tr from-primary to-accent rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
                <svg className="absolute right-0 bottom-0 w-full h-full text-border/40" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,100 L100,0 L100,100 Z" fill="currentColor" />
                </svg>
              </div>

              <div className="relative z-10 p-12 sm:p-20 lg:p-24 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 md:pr-12">
                  <h2 className="text-5xl sm:text-7xl lg:text-[6rem] font-black leading-[0.9] tracking-tighter mb-8 text-foreground">
                    Don&apos;t just <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-chart-2">play.</span> Train.
                  </h2>
                  <p className="text-xl sm:text-2xl text-muted-foreground font-medium mb-10 max-w-xl">
                    Join ambitious players who have switched from random puzzle solving to deliberate, scientific practice.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/sign-up">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto h-20 px-12 text-xl font-black rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.4)]"
                      >
                        Start Free Training
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-8 flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Free • No credit card
                  </div>
                </div>

                {/* Decorative Giant Chess Piece or Icon */}
                <div className="hidden md:flex flex-1 justify-center relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="w-64 h-64 border-12 border-dashed border-border/50 rounded-full flex items-center justify-center relative"
                  >
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    >
                      <Target className="w-32 h-32 text-primary opacity-80" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer - Minimal & Bold */}
        <footer className="py-16 bg-background border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 lg:col-span-2">
                <Link href="/" className="inline-flex items-center gap-4 group mb-6">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-transform group-hover:rotate-12">
                    <Image
                      src="/pecklogoicon.png"
                      alt="Peck Logo"
                      fill
                      sizes="48px"
                      className="object-contain p-2"
                    />
                  </div>
                  <span className="font-serif text-4xl font-black tracking-tighter">
                    Peck
                  </span>
                </Link>
                <p className="text-xl font-medium text-muted-foreground max-w-sm">
                  The scientific way to master chess tactics through spaced repetition.
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/50 mb-2">Product</h4>
                {[
                  { label: "Features", href: "/features" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "The Method", href: "/woodpecker-method" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/50 mb-2">Company</h4>
                {[
                  { label: "About", href: "/about" },
                  { label: "Blog", href: "/blog" },
                  { label: "Contact", href: "mailto:support@peckchess.com" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-sm font-bold text-muted-foreground">
                © {new Date().getFullYear()} Peck. All rights reserved.
              </div>
              <div className="flex gap-8 text-sm font-bold text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
