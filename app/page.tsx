"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  ArrowRight,
  Brain,
  Target,
  Trophy,
  Sparkles,
  Zap,
  Repeat,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Chessboard } from "react-chessboard";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Header */}
      <header className="fixed top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Image 
              src="/darklogo.png" 
              alt="Peck Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="font-serif tracking-tight">Peck</span>
          </div>
          <nav className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hover:bg-primary/5">
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="shadow-md shadow-primary/20">Start Training</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="sm" className="shadow-md shadow-primary/20">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <motion.div
                className="flex-1 text-center lg:text-left"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
                  <Sparkles className="h-4 w-4" />
                  <span>The Scientific Way to Master Chess</span>
                </motion.div>

                <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
                  Don't just solve. <br />
                  <span className="text-primary relative inline-block italic">
                    Internalize.
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                  The Woodpecker Method isn't about solving new puzzles every day. It's about solving the <span className="font-semibold text-foreground">same best puzzles</span> faster and faster until the patterns are burned into your subconscious.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                      Start Your First Cycle
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full h-14 px-8 text-lg rounded-2xl border-2 hover:bg-accent/50">
                      How It Works
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={fadeInUp} className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Scientific Spaced Repetition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Lichess Database</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Visual Element */}
              <motion.div
                className="flex-1 w-full max-w-md lg:max-w-full relative"
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card/50 backdrop-blur-sm p-8 flex flex-col justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

                  {/* Chessboard Layer */}
                  <div className="relative z-20 mb-6">
                    <div className="relative w-full max-w-[360px] mx-auto">
                      {/* Board glow effect */}
                      <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-2xl blur-xl opacity-60" />

                      <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50">
                        <Chessboard
                          options={{
                            position: "6k1/p4pp1/2p1pb2/1q5p/N1Q5/1P2P1P1/P2r1P1P/2R3K1 w - - 1 26",
                            allowDragging: false,
                            darkSquareStyle: { backgroundColor: 'oklch(0.6 0.1 145)' },
                            lightSquareStyle: { backgroundColor: 'oklch(0.96 0.03 145)' },
                            boardStyle: {
                              borderRadius: '12px',
                            },
                            // Highlight the winning move squares
                            squareStyles: {
                              c4: { backgroundColor: 'rgba(255, 255, 0, 0.35)' },
                              c1: { backgroundColor: 'rgba(255, 255, 0, 0.25)' },
                            },
                          }}
                        />
                      </div>

                      {/* "White to move" indicator */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-background border border-border shadow-lg">
                        <span className="text-sm font-medium text-muted-foreground">White to move</span>
                      </div>
                    </div>
                  </div>

                  {/* Abstract Representation of Cycles */}
                  <div className="relative z-10 space-y-6 bg-card/80 backdrop-blur-md rounded-xl p-6 border border-border/50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Woodpecker Progress</h3>
                          <p className="text-xs text-muted-foreground">Set #142 • 150 Puzzles</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary leading-none">8x</div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Faster</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Cycle 1 */}
                      <div className="group">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Cycle 1</span>
                          <span className="font-mono text-muted-foreground">45m 00s</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-muted-foreground/20 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Cycle 2 */}
                      <div className="group">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Cycle 2</span>
                          <span className="font-mono text-muted-foreground">22m 30s</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "50%" }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="h-full bg-primary/30 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Cycle 3 */}
                      <div className="group">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Cycle 3</span>
                          <span className="font-mono text-muted-foreground">11m 15s</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "25%" }}
                            transition={{ duration: 1, delay: 1.1 }}
                            className="h-full bg-primary/60 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Cycle 4 - Highlighted */}
                      <div className="relative pt-1">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-primary font-bold flex items-center gap-1.5">
                            <Zap className="h-3 w-3 fill-current" />
                            Cycle 4
                          </span>
                          <span className="font-mono font-bold text-primary">05m 30s</span>
                        </div>
                        <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden ring-2 ring-primary/10 ring-offset-1 ring-offset-card">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "12%" }}
                            transition={{ duration: 1, delay: 1.4 }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)] shadow-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-border/50">
              {[
                { label: "Puzzles Available", value: "1.5M+", icon: Target },
                { label: "Avg. Rating Gain", value: "+150", icon: TrendingUp },
                { label: "Completion Rate", value: "94%", icon: Trophy },
              ].map((stat, i) => (
                <div key={i} className="py-8 px-4 text-center group hover:bg-background/50 transition-colors">
                  <stat.icon className="h-6 w-6 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Bento Grid Style */}
        <section id="how-it-works" className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                The Path to <span className="text-primary">Intuition</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Most players solve a puzzle once and forget it. The Woodpecker Method forces your brain to recognize patterns instantly through aggressive repetition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(250px,auto)]">
              {/* Step 1: Large Card - The Method */}
              <div className="md:col-span-2 rounded-3xl border border-border bg-card p-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Repeat className="w-48 h-48" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                      <span className="font-bold text-xl">1</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">The Woodpecker Method</h3>
                    <p className="text-muted-foreground text-lg max-w-md">
                      Solve a set of puzzles. Then do it again, faster. And again. Until the patterns are burned into your subconscious and you recognize them instantly.
                    </p>
                  </div>
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { cycle: 1, time: "60m", label: "Solve" },
                      { cycle: 2, time: "30m", label: "Repeat" },
                      { cycle: 3, time: "15m", label: "Reinforce" },
                      { cycle: 4, time: "7m", label: "Master" },
                    ].map((item, i) => (
                      <div key={i} className="bg-background/50 rounded-lg p-3 border border-border/50 text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
                        <div className="font-bold text-primary">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Tall Card - Gamification */}
              <div className="md:row-span-2 rounded-3xl border border-border bg-card p-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-card to-secondary/20">
                <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy className="w-64 h-64" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                    <span className="font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Stay Motivated</h3>
                  <p className="text-muted-foreground text-lg mb-8">
                    Training is hard. We make it addictive with a complete progression system.
                  </p>
                  <div className="space-y-6 mt-auto">
                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                          <Trophy className="h-4 w-4" />
                        </div>
                        <div className="font-semibold">Leaderboards</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Compete globally or with friends for the top spot.</p>
                    </div>

                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div className="font-semibold">Daily Streaks</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Build a habit. Don't break the chain.</p>
                    </div>

                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="font-semibold">Achievements</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Unlock badges for speed, accuracy, and consistency.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Standard Card - Analytics */}
              <div className="rounded-3xl border border-border bg-card p-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                    <span className="font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Smart Analytics</h3>
                  <p className="text-muted-foreground">
                    Visualize your improvement with detailed charts. Track your accuracy, speed, and "Woodpecker Index" over time.
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-20">
                  <TrendingUp className="w-24 h-24" />
                </div>
              </div>

              {/* Step 4: Standard Card - Content */}
              <div className="rounded-3xl border border-border bg-card p-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                    <span className="font-bold text-xl">4</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Curated Puzzles</h3>
                  <p className="text-muted-foreground">
                    Millions of puzzles from Lichess, filtered for quality and tactical motifs. No more bad puzzles.
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-20">
                  <Target className="w-24 h-24" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-16 text-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to transform your chess?</h2>
                <p className="text-primary-foreground/80 text-lg mb-10">
                  Join players who have switched from random solving to deliberate practice.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sign-up">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold shadow-xl">
                      Start Training
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      Log In
                    </Button>
                  </Link>
                </div>
                <p className="mt-6 text-sm text-primary-foreground/60">
                  No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Image 
                src="/darklogo.png" 
                alt="Peck Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
              <span>Peck</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Peck. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <a href="mailto:dwyc.co@gmail.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
