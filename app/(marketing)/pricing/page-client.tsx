import Link from "next/link";
import {
  MotionDiv,
  MotionListItem,
} from "@/components/marketing/motion-div";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Heart,
  Shield,
} from "lucide-react";

const included = [
  "Unlimited Woodpecker Method puzzle sets",
  "1.5M+ high-quality puzzles from Lichess",
  "Progress analytics and cycle time tracking",
  "Achievements, streaks, and leaderboards",
  "Personalized set creation by rating and theme",
  "No ads, no paywalls",
];

export default function PricingPageContent() {
  return (
    <div className="overflow-x-hidden bg-background">
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] pointer-events-none select-none flex flex-col leading-[0.8]">
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            START
          </span>
          <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap">
            TRAINING
          </span>
        </div>

        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 rounded-full bg-background/50 border border-primary/20 px-6 py-2.5 shadow-lg backdrop-blur-xl mb-8">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                Pricing
              </span>
            </div>

            <h1 className="text-[5rem] sm:text-[7rem] lg:text-[9rem] font-black leading-[0.9] tracking-tighter mb-8 text-foreground">
              One price: <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                $0
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Peck is free because we believe the Woodpecker Method should be
              accessible to every chess player. No credit card, no trial-just
              start training.
            </p>
          </MotionDiv>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <MotionDiv
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] border-[3px] border-primary bg-card/40 backdrop-blur-2xl shadow-[0_0_80px_rgba(var(--color-primary-rgb),0.15)] overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent pointer-events-none" />

            <div className="grid md:grid-cols-2 relative z-10">
              <div className="p-10 sm:p-16 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-center text-center md:text-left">
                <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-8">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="font-black text-xl tracking-tight">
                    Everything Included
                  </span>
                </div>

                <div className="flex items-baseline justify-center md:justify-start gap-2 mb-6">
                  <span className="text-[6rem] sm:text-[8rem] font-black leading-none tracking-tighter text-foreground">
                    $0
                  </span>
                </div>

                <p className="text-xl text-muted-foreground font-medium mb-12">
                  Full access. No limits. <br className="hidden md:block" /> No
                  credit card required.
                </p>

                <Link href="/sign-up" className="w-full">
                  <Button
                    size="lg"
                    className="w-full h-20 text-xl rounded-[2rem] bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.4)] font-black"
                  >
                    Start free training
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              </div>

              <div className="p-10 sm:p-16 bg-muted/20 flex flex-col justify-center">
                <h3 className="text-sm font-black tracking-widest uppercase mb-8 text-muted-foreground">
                  What&apos;s inside
                </h3>
                <ul className="space-y-6">
                  {included.map((item, i) => (
                    <MotionListItem
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 group/item"
                    >
                      <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-bold text-foreground">
                        {item}
                      </span>
                    </MotionListItem>
                  ))}
                </ul>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="py-32 relative bg-foreground text-background overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] opacity-10 pointer-events-none">
          <MotionDiv
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-[800px] h-[800px]" />
          </MotionDiv>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <h2 className="text-sm font-black tracking-widest text-primary uppercase mb-6 flex items-center gap-4">
              <span className="w-12 h-1 bg-primary"></span>
              The Philosophy
            </h2>
            <h3 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.1] mb-12">
              Why is Peck{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-chart-2 italic">
                free?
              </span>
            </h3>
            <p className="text-2xl sm:text-3xl font-medium opacity-80 leading-relaxed max-w-3xl">
              We use open-source puzzles from Lichess and want to help players
              improve without financial barriers. The Woodpecker Method works-we
              built Peck so everyone can use it. No upsells, no premium tiers.
              Just pure tactical training.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
