import Link from "next/link";
import { MotionDiv } from "@/components/marketing/motion-div";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Repeat,
  Clock,
  Brain,
  Trophy,
  Flame,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const featureGroups = [
  {
    id: "01",
    title: "THE WOODPECKER METHOD",
    description:
      "Solve the same set of puzzles in cycles, getting faster each time until patterns become automatic.",
    icon: Brain,
    color: "bg-primary",
    textColor: "text-primary",
    items: [
      { icon: Repeat, text: "Multiple cycles per puzzle set" },
      { icon: Clock, text: "Track cycle times and halve them each round" },
      { icon: Brain, text: "Build subconscious pattern recognition" },
    ],
  },
  {
    id: "02",
    title: "GAMIFICATION",
    description:
      "Stay motivated with streaks, achievements, and leaderboards. Chess improvement is a marathon-we keep you engaged.",
    icon: Trophy,
    color: "bg-chart-2",
    textColor: "text-chart-2",
    items: [
      { icon: Flame, text: "Daily streaks and consistency tracking" },
      { icon: Trophy, text: "Global leaderboards and leagues" },
      { icon: Sparkles, text: "Unlockable achievements and badges" },
    ],
  },
  {
    id: "03",
    title: "ANALYTICS",
    description:
      "See where you're improving and where to focus. Accuracy, speed, and theme-specific performance at a glance.",
    icon: TrendingUp,
    color: "bg-foreground",
    textColor: "text-foreground",
    items: [
      { icon: TrendingUp, text: "Accuracy and speed trends over time" },
      { icon: Target, text: "Theme-specific performance breakdown" },
      { icon: Zap, text: "Problem puzzles that need extra attention" },
    ],
  },
  {
    id: "04",
    title: "PREMIUM CONTENT",
    description:
      "High-quality puzzles from Lichess, filtered by rating and theme. Real game positions, not compositions.",
    icon: Target,
    color: "bg-accent",
    textColor: "text-accent",
    items: [
      { icon: CheckCircle2, text: "1.5M+ verified puzzles" },
      { icon: Target, text: "Filter by rating band and themes" },
      { icon: Brain, text: "Real game positions, not compositions" },
    ],
  },
];

export default function FeaturesPageContent() {
  return (
    <div className="overflow-x-hidden bg-background">
      <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] pointer-events-none select-none flex flex-col leading-[0.8]">
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            SYSTEM
          </span>
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            FEATURES
          </span>
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-chart-2/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 rounded-full bg-background/50 border border-primary/20 px-6 py-2.5 shadow-lg backdrop-blur-xl mb-8">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Everything you need
                </span>
              </div>

              <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black leading-[0.9] tracking-tighter mb-8 text-foreground">
                Built for <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-2 to-primary bg-300% animate-gradient">
                  tactical mastery.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed mb-12">
                We&apos;ve combined the Woodpecker Method with modern tech so you
                can train smarter, stay motivated, and see real improvement.
              </p>

              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-16 px-10 text-lg rounded-[2rem] bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:shadow-[0_0_60px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] font-black"
                >
                  Start free training
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </MotionDiv>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {featureGroups.map((group) => (
              <MotionDiv
                key={group.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div
                  className={`text-[8rem] md:text-[14rem] font-black leading-none opacity-[0.03] absolute -top-20 -left-8 md:-top-32 md:-left-16 select-none pointer-events-none ${group.textColor}`}
                >
                  {group.id}
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">
                  <div>
                    <h2 className="text-sm font-black tracking-widest uppercase mb-6 flex items-center gap-4">
                      <span className={`w-12 h-1 ${group.color}`}></span>
                      {group.title}
                    </h2>
                    <p className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-8">
                      {group.description}
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-6">
                    {group.items.map((item, j) => (
                      <MotionDiv
                        key={`${group.id}-${item.text}`}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: j * 0.1 }}
                        className="flex items-center gap-6 p-6 rounded-3xl bg-card border-2 border-border/50 shadow-lg hover:border-primary/30 transition-colors"
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl ${group.color}/10 flex items-center justify-center ${group.textColor}`}
                        >
                          <item.icon className="w-8 h-8" />
                        </div>
                        <span className="text-xl font-bold text-foreground">
                          {item.text}
                        </span>
                      </MotionDiv>
                    ))}
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden bg-foreground text-background">
        <div className="absolute top-1/2 left-0 w-full flex overflow-hidden opacity-5 pointer-events-none -translate-y-1/2">
          <MotionDiv
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex whitespace-nowrap text-[15rem] font-black"
          >
            TRAIN LIKE A WOODPECKER • TRAIN LIKE A WOODPECKER •
          </MotionDiv>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter mb-8">
              Ready to train like a{" "}
              <span className="text-primary italic">Woodpecker?</span>
            </h2>
            <p className="text-2xl opacity-80 mb-12 font-medium">
              Join players who&apos;ve switched from random solving to deliberate
              practice. It&apos;s free.
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-20 px-12 text-xl font-black rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.4)]"
              >
                Get started free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
