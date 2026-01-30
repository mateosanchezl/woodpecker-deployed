import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";
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

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.features),
  title: PAGE_METADATA.features.title,
};

const featureGroups = [
  {
    title: "The Woodpecker Method",
    description:
      "Solve the same set of puzzles in cycles, getting faster each time until patterns become automatic.",
    icon: Brain,
    items: [
      { icon: Repeat, text: "Multiple cycles per puzzle set" },
      { icon: Clock, text: "Track cycle times and halve them each round" },
      { icon: Brain, text: "Build subconscious pattern recognition" },
    ],
  },
  {
    title: "Gamification",
    description:
      "Stay motivated with streaks, achievements, and leaderboards. Chess improvement is a marathon—we keep you engaged.",
    icon: Trophy,
    items: [
      { icon: Flame, text: "Daily streaks and consistency tracking" },
      { icon: Trophy, text: "Global leaderboards and leagues" },
      { icon: Sparkles, text: "Unlockable achievements and badges" },
    ],
  },
  {
    title: "Analytics",
    description:
      "See where you're improving and where to focus. Accuracy, speed, and theme-specific performance at a glance.",
    icon: TrendingUp,
    items: [
      { icon: TrendingUp, text: "Accuracy and speed trends over time" },
      { icon: Target, text: "Theme-specific performance breakdown" },
      { icon: Zap, text: "Problem puzzles that need extra attention" },
    ],
  },
  {
    title: "Premium content",
    description:
      "High-quality puzzles from Lichess, filtered by rating and theme. Real game positions, not compositions.",
    icon: Target,
    items: [
      { icon: CheckCircle2, text: "1.5M+ verified puzzles" },
      { icon: Target, text: "Filter by rating band and themes" },
      { icon: Brain, text: "Real game positions, not compositions" },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-border/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial from-primary/10 to-transparent -z-10 pointer-events-none" />
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Everything you need</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Built for <span className="text-primary">tactical mastery</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            We&apos;ve combined the Woodpecker Method with modern tech so you can
            train smarter, stay motivated, and see real improvement.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-12 px-8 rounded-2xl shadow-lg shadow-primary/20"
            >
              Start free training
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 sm:py-24">
        <div className="space-y-20">
          {featureGroups.map((group, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card overflow-hidden p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <group.icon className="h-7 w-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">{group.title}</h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    {group.description}
                  </p>
                  <ul className="space-y-4">
                    {group.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to train like a Woodpecker?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Join players who&apos;ve switched from random solving to deliberate
            practice. Free forever.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 rounded-2xl font-semibold"
            >
              Get started free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
