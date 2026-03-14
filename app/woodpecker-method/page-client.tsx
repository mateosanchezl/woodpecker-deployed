import Image from "next/image";
import Link from "next/link";
import { MotionDiv } from "@/components/marketing/motion-div";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing/navbar";
import { XIcon } from "@/components/icons/x-icon";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Repeat,
  Brain,
  Zap,
  BookOpen,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/site-config";

export default function WoodpeckerMethodPageContent() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />

      <main>
        <section className="relative min-h-[80vh] flex items-center pt-32 pb-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] pointer-events-none select-none flex flex-col leading-[0.8]">
            <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
              THE
            </span>
            <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
              METHOD
            </span>
          </div>

          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-chart-2/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-3 rounded-full bg-background/50 border border-primary/20 px-6 py-2.5 shadow-lg backdrop-blur-xl mb-8">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Complete Guide
                  </span>
                </div>

                <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black leading-[0.9] tracking-tighter mb-8 text-foreground">
                  The{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-2 to-primary bg-300% animate-gradient">
                    Woodpecker
                  </span>{" "}
                  <br /> Method.
                </h1>

                <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed mb-12">
                  The scientifically-proven chess training technique that builds
                  tactical pattern recognition through intensive puzzle
                  repetition.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full h-16 px-10 text-lg rounded-[2rem] bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:shadow-[0_0_60px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] font-black"
                    >
                      Try It Free
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-16 px-10 text-lg rounded-[2rem] border-2 hover:bg-muted font-bold backdrop-blur-md"
                    >
                      How It Works
                    </Button>
                  </Link>
                </div>
              </MotionDiv>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border-2 border-border/50 rounded-[3rem] p-8 sm:p-16 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Brain className="w-64 h-64 text-foreground" />
                </div>

                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-8 relative z-10">
                  Explained
                </h2>

                <div className="space-y-6 text-xl text-muted-foreground font-medium leading-relaxed relative z-10">
                  <p>
                    The{" "}
                    <strong className="text-foreground">
                      Woodpecker Method
                    </strong>{" "}
                    is a chess training technique developed by Swedish
                    Grandmaster{" "}
                    <strong className="text-foreground">Axel Smith</strong> and
                    International Master{" "}
                    <strong className="text-foreground">Hans Tikkanen</strong>.
                    Published in their 2018 book, this method has helped
                    countless players improve their tactical ability through a
                    simple but powerful approach:
                    <em className="text-foreground block mt-4 border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-xl">
                      Solve the same puzzles repeatedly until the patterns become
                      automatic.
                    </em>
                  </p>

                  <p>
                    Unlike traditional puzzle training where you solve new
                    puzzles every day, the Woodpecker Method focuses on{" "}
                    <strong className="text-foreground">
                      repetition and speed
                    </strong>
                    . You select a fixed set of tactical puzzles and solve them
                    in cycles, getting faster each time. By the end of your
                    training, patterns that once required minutes of calculation
                    are recognized instantly.
                  </p>
                </div>

                <div className="mt-12 bg-primary/10 border-2 border-primary/20 rounded-3xl p-8 relative z-10">
                  <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-primary">
                    <Brain className="h-8 w-8" />
                    Why &quot;Woodpecker&quot;?
                  </h3>
                  <p className="text-lg text-primary/80 font-medium">
                    The name comes from how woodpeckers repeatedly peck at trees
                    with rapid, consistent strikes. Similarly, you repeatedly
                    &quot;peck&quot; at the same puzzles, each time getting
                    faster and more accurate until the patterns are burned into
                    your chess intuition.
                  </p>
                </div>
              </MotionDiv>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-32 relative bg-foreground text-background overflow-hidden"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black tracking-tighter leading-[0.9] mb-24">
                The{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                  Process.
                </span>
              </h2>

              <div className="grid gap-8">
                {[
                  {
                    step: 1,
                    title: "Create Your Puzzle Set",
                    description:
                      "Select 100-300 tactical puzzles slightly below your rating. Quality matters more than quantity. Peck automatically curates high-quality puzzles from the Lichess database.",
                    icon: Target,
                    time: "5 minutes",
                  },
                  {
                    step: 2,
                    title: "Cycle 1: Solve Carefully",
                    description:
                      "Solve all puzzles in your set, taking time to calculate fully. Don't rush this first cycle. Understanding each pattern deeply is crucial for later speed.",
                    icon: Clock,
                    time: "45-60 minutes",
                  },
                  {
                    step: 3,
                    title: "Cycle 2: Build Speed",
                    description:
                      "Solve the same puzzles again. You'll recognize patterns from Cycle 1 and solve faster. Aim to cut your total time in half.",
                    icon: Repeat,
                    time: "20-30 minutes",
                  },
                  {
                    step: 4,
                    title: "Cycles 3-5: Master Patterns",
                    description:
                      "Continue repeating the set. Each cycle should be faster as patterns become automatic. Most users achieve 8x speed improvement by cycle 4-5.",
                    icon: Zap,
                    time: "7-15 minutes",
                  },
                  {
                    step: 5,
                    title: "Track and Analyze",
                    description:
                      "Monitor your cycle times and accuracy. Identify problem puzzles that need extra attention. When times plateau, you've mastered the set.",
                    icon: TrendingUp,
                    time: "Ongoing",
                  },
                ].map((item, i) => (
                  <MotionDiv
                    key={item.step}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row gap-8 bg-background/5 border-2 border-background/10 rounded-[3rem] p-8 sm:p-12 hover:bg-background/10 transition-colors"
                  >
                    <div className="shrink-0 flex md:flex-col items-center md:items-start gap-6 md:w-48">
                      <div className="text-[5rem] font-black leading-none opacity-20 text-primary">
                        0{item.step}
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)]">
                        <item.icon className="h-8 w-8" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-4 py-1.5 rounded-full bg-background/20 text-sm font-bold tracking-widest uppercase">
                          Time: {item.time}
                        </span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black mb-4">
                        {item.title}
                      </h3>
                      <p className="text-xl opacity-70 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-sm font-black tracking-widest text-primary uppercase mb-6 flex items-center justify-center gap-4 text-center">
                <span className="w-12 h-1 bg-primary"></span>
                The Science
                <span className="w-12 h-1 bg-primary"></span>
              </h2>
              <h3 className="text-5xl sm:text-7xl font-black tracking-tighter mb-20 text-center">
                Why it works.
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Pattern Recognition",
                    description:
                      "Repeated exposure trains your brain to recognize motifs instantly.",
                  },
                  {
                    title: "Speed Under Pressure",
                    description:
                      "When patterns are automatic, you save time in real games for complex positions.",
                  },
                  {
                    title: "Confidence Building",
                    description:
                      "Knowing you've mastered specific patterns gives you confidence to play sharply.",
                  },
                  {
                    title: "Measurable Progress",
                    description:
                      "Cycle time improvements provide concrete evidence of your growth.",
                  },
                  {
                    title: "Efficient Training",
                    description:
                      "No time wasted. Every puzzle contributes to building your tactical foundation.",
                  },
                  {
                    title: "Scientific Basis",
                    description:
                      "Based on spaced repetition principles proven effective in learning research.",
                  },
                ].map((benefit, i) => (
                  <MotionDiv
                    key={benefit.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border-2 border-border/50 rounded-3xl p-8 hover:border-primary/50 transition-colors group"
                  >
                    <CheckCircle2 className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-black mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                      {benefit.description}
                    </p>
                  </MotionDiv>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 relative bg-primary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-[4rem] sm:text-[6rem] font-black tracking-tighter leading-[0.9] mb-8">
              Start Your Training
            </h2>
            <p className="text-2xl opacity-90 mb-12 font-medium max-w-2xl mx-auto">
              Join thousands of chess players improving their tactics. Free, no
              credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-20 px-12 text-xl font-black rounded-full bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-transform shadow-2xl"
                >
                  Create Free Account
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-4 group mb-6">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-transform group-hover:rotate-12">
                  <Image
                    src="/pecklogoicon.png"
                    alt="Peck logo"
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
                The scientific way to master chess tactics through spaced
                repetition.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/50 mb-2">
                Product
              </h4>
              {[
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "The Method", href: "/woodpecker-method" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/50 mb-2">
                Company
              </h4>
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "mailto:support@peckchess.com" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={SOCIAL_LINKS.x.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Follow Peck on X (${SOCIAL_LINKS.x.handle})`}
                className="inline-flex items-center gap-3 text-lg font-bold text-foreground hover:text-primary transition-colors"
              >
                <XIcon className="size-4" />
                <span>{SOCIAL_LINKS.x.handle}</span>
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm font-bold text-muted-foreground">
              © {new Date().getFullYear()} Peck. All rights reserved.
            </div>
            <div className="flex gap-8 text-sm font-bold text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
