import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import {
  Target,
  Heart,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.about),
  title: PAGE_METADATA.about.title,
};

const values = [
  {
    icon: Target,
    title: "Focus on what works",
    description:
      "The Woodpecker Method is backed by learning science. We don't add gimmicks—we implement the method well so you can improve.",
  },
  {
    icon: Heart,
    title: "Accessible to everyone",
    description:
      "Chess improvement shouldn't cost money. We keep Peck free so players at any level can train with the same tools.",
  },
  {
    icon: Zap,
    title: "Simple and effective",
    description:
      "Create a set, solve in cycles, track progress. No clutter. We remove friction so you spend time on puzzles, not on the app.",
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-border/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial from-primary/10 to-transparent -z-10 pointer-events-none" />
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <BookOpen className="h-4 w-4" />
            <span>Our mission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Tactical improvement for <span className="text-primary">everyone</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Peck is the free Woodpecker Method chess training app. We built it
            so you can master tactics through repetition—the same way
            grandmasters do—without paying a cent.
          </p>
          <Link href="/woodpecker-method">
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-2xl">
              What is the Woodpecker Method?
            </Button>
          </Link>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24">
        <div className="space-y-12">
          {values.map((value, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start"
            >
              <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <value.icon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">{value.title}</h2>
                <p className="text-muted-foreground text-lg">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What we offer */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">
            What you get with Peck
          </h2>
          <ul className="space-y-4">
            {[
              "Woodpecker Method cycles with automatic tracking",
              "1.5M+ puzzles from the Lichess database, filtered by rating and theme",
              "Progress analytics: cycle times, accuracy, problem puzzles",
              "Streaks, achievements, and global leaderboards",
              "Personalized puzzle sets—you choose size and difficulty",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Start training today
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Free forever. No credit card. Just better chess.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 rounded-2xl font-semibold"
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
