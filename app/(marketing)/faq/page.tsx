import type { Metadata } from "next";
import Link from "next/link";
import {
  generatePageMetadata,
  PAGE_METADATA,
  generateWoodpeckerFAQSchema,
} from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.faq),
  title: PAGE_METADATA.faq.title,
};

const faqs = [
  {
    q: "What is the Woodpecker Method?",
    a: "The Woodpecker Method is a chess training technique developed by GM Axel Smith and Hans Tikkanen. It involves solving a fixed set of tactical puzzles repeatedly, getting faster each cycle. This repetition builds pattern recognition, allowing you to spot tactical motifs instantly in real games. The method is scientifically proven to improve tactical ability more effectively than solving new puzzles.",
  },
  {
    q: "How does the Woodpecker Method work?",
    a: "You select 100–300 puzzles and solve them in cycles. Cycle 1 takes the longest as you calculate carefully. Each subsequent cycle gets faster as you recognize patterns. By cycles 4–5, what took 60 minutes might take only 7–8 minutes. That speed means the patterns are now automatic—burned into your subconscious.",
  },
  {
    q: "How many puzzles should be in a Woodpecker Method set?",
    a: "Most players find success with 100–300 puzzles per set. Beginners should start with 100–150 to keep cycles manageable. The key is choosing a size you can complete in 30–60 minutes for the first cycle.",
  },
  {
    q: "What rating should Woodpecker Method puzzles be?",
    a: "Choose puzzles slightly below your peak tactical ability—typically 100–200 points below your puzzle rating. If you're rated 1500, use puzzles around 1300–1400. The goal is to build speed and pattern recognition, not to struggle on every puzzle.",
  },
  {
    q: "How many cycles should I complete?",
    a: "The method recommends 3–7 cycles per set. Most users see big improvement after 4–5 cycles. You've mastered a set when your cycle time plateaus and you recognize patterns instantly. Then create a new set.",
  },
  {
    q: "Is the Woodpecker Method effective?",
    a: "Yes. It's based on spaced repetition and pattern recognition from learning science. Many players gain 100–200 rating points in tactical ability after consistent Woodpecker training. It's especially effective if you've plateaued from solving random puzzles.",
  },
  {
    q: "What is the best Woodpecker Method app?",
    a: "Peck is a free app built specifically for the Woodpecker Method: curated Lichess puzzles, automatic cycle tracking, progress analytics, streaks, and achievements. No paywalls, no ads.",
  },
  {
    q: "Can I use the Woodpecker Method for free?",
    a: "Yes. Peck is completely free. You get millions of puzzles, unlimited puzzle sets, full progress tracking, and all features at no cost. No credit card required.",
  },
  {
    q: "How long does a cycle take?",
    a: "It depends on set size and level. For a 150-puzzle set, Cycle 1 is often 45–60 minutes, Cycle 2 around 20–30 minutes. By Cycle 4–5, many users finish in 7–15 minutes. That drop in time shows the patterns are internalized.",
  },
  {
    q: "Where did the Woodpecker Method come from?",
    a: "Swedish GM Axel Smith and IM Hans Tikkanen developed it and published it in their 2018 book 'The Woodpecker Method'. The name comes from how woodpeckers repeatedly peck at trees—just as you repeatedly solve the same puzzles. Both authors used it on their path to their titles.",
  },
  {
    q: "How much does Peck cost?",
    a: "Peck is free. Unlimited sets, analytics, achievements, and leaderboards are all included at no cost.",
  },
  {
    q: "Why is Peck free?",
    a: "We believe the Woodpecker Method should be accessible to every chess player. We use open-source puzzles from Lichess and want to remove financial barriers to improvement.",
  },
];

export default function FAQPage() {
  const faqSchema = generateWoodpeckerFAQSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="overflow-x-hidden">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 border-b border-border/40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial from-primary/10 to-transparent -z-10 pointer-events-none" />
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <HelpCircle className="h-4 w-4" />
              <span>Common questions</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Frequently asked <span className="text-primary">questions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Everything you need to know about the Woodpecker Method and Peck.
            </p>
          </div>
        </section>

        {/* FAQ list */}
        <section className="py-16 sm:py-24">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 hover:border-primary/20 transition-colors"
              >
                <h2 className="text-lg font-semibold mb-3">{faq.q}</h2>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to try the Woodpecker Method?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Start training for free. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <Link href="/woodpecker-method">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-2xl bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Read the full guide
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
