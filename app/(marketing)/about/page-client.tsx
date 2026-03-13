import Link from "next/link";
import { MotionDiv } from "@/components/marketing/motion-div";
import { Button } from "@/components/ui/button";
import {
  Target,
  Heart,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Focus on what works",
    description:
      "The Woodpecker Method is backed by learning science. We don't add gimmicks-we implement the method well so you can improve.",
    color: "bg-primary",
    textColor: "text-primary",
  },
  {
    icon: Heart,
    title: "Accessible to everyone",
    description:
      "Chess improvement shouldn't cost money. We keep Peck free so players at any level can train with the same tools.",
    color: "bg-chart-2",
    textColor: "text-chart-2",
  },
  {
    icon: Zap,
    title: "Simple and effective",
    description:
      "Create a set, solve in cycles, track progress. No clutter. We remove friction so you spend time on puzzles, not on the app.",
    color: "bg-accent",
    textColor: "text-accent",
  },
];

export default function AboutPageContent() {
  return (
    <div className="overflow-x-hidden bg-background">
      <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] pointer-events-none select-none flex flex-col leading-[0.8]">
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            MISSION
          </span>
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            CONTROL
          </span>
        </div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 rounded-full bg-background/50 border border-primary/20 px-6 py-2.5 shadow-lg backdrop-blur-xl mb-8">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Our Mission
                </span>
              </div>

              <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black leading-[0.9] tracking-tighter mb-8 text-foreground">
                Tactical improvement <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-chart-2 to-primary bg-300% animate-gradient">
                  for everyone.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed mb-12">
                Peck is the free Woodpecker Method chess training app. We built
                it so you can master tactics through repetition-the same way
                grandmasters do-without paying a cent.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/woodpecker-method" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full h-16 px-10 text-lg rounded-[2rem] bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.1)] hover:shadow-[0_0_60px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] font-black"
                  >
                    Read The Method
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-sm font-black tracking-widest text-primary uppercase mb-6 flex items-center gap-4">
              <span className="w-12 h-1 bg-primary"></span>
              Core Values
            </h2>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter">
              Built on <span className="italic opacity-50">principles.</span>
            </h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {values.map((value, i) => (
              <MotionDiv
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-[2.5rem] border-2 border-border/50 bg-card/40 backdrop-blur-xl p-10 overflow-hidden group hover:border-primary/50 transition-colors"
              >
                <div
                  className={`absolute top-0 right-0 w-48 h-48 ${value.color} opacity-5 blur-[80px] group-hover:opacity-20 transition-opacity duration-500`}
                />

                <div
                  className={`w-20 h-20 rounded-3xl ${value.color}/10 flex items-center justify-center mb-8 ${value.textColor}`}
                >
                  <value.icon className="h-10 w-10" />
                </div>

                <h4 className="text-3xl font-black tracking-tight mb-6">
                  {value.title}
                </h4>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                  {value.description}
                </p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative bg-foreground text-background overflow-hidden">
        <div className="absolute left-[-10%] top-1/4 w-[50%] h-[50%] bg-primary rounded-full blur-[150px] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[4rem] sm:text-[6rem] font-black tracking-tighter leading-[0.9] mb-16 text-center">
              The complete <br className="hidden sm:block" />
              <span className="text-primary italic">arsenal.</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8 text-xl font-bold">
              {[
                "Woodpecker Method cycles with automatic tracking",
                "1.5M+ puzzles from the Lichess database",
                "Progress analytics: cycle times, accuracy, problem puzzles",
                "Streaks, achievements, and global leaderboards",
                "Personalized puzzle sets by size and difficulty",
              ].map((item, i) => (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-6 p-6 rounded-3xl bg-background/5 border border-background/10 hover:bg-background/10 transition-colors"
                >
                  <div className="mt-1 bg-primary text-primary-foreground p-1 rounded-full shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="leading-snug opacity-90">{item}</span>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
