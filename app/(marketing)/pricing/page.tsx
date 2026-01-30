import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Heart,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.pricing),
  title: PAGE_METADATA.pricing.title,
};

const included = [
  "Unlimited Woodpecker Method puzzle sets",
  "1.5M+ high-quality puzzles from Lichess",
  "Progress analytics and cycle time tracking",
  "Achievements, streaks, and leaderboards",
  "Personalized set creation by rating and theme",
  "No ads, no paywalls",
];

export default function PricingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-border/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial from-primary/10 to-transparent -z-10 pointer-events-none" />
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Heart className="h-4 w-4" />
            <span>Free forever</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            One price: <span className="text-primary">$0</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Peck is free because we believe the Woodpecker Method should be
            accessible to every chess player. No credit card, no trial—just
            start training.
          </p>
        </div>
      </section>

      {/* Plan card */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border-2 border-primary/30 bg-card shadow-xl overflow-hidden">
            <div className="bg-primary/5 border-b border-border p-8 sm:p-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Everything included</span>
              </div>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl sm:text-6xl font-bold">$0</span>
                <span className="text-muted-foreground">/ forever</span>
              </div>
              <p className="text-muted-foreground mb-8">
                Full access. No limits. No credit card required.
              </p>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-10 rounded-2xl shadow-lg shadow-primary/20"
                >
                  Start free training
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="p-8 sm:p-10">
              <ul className="space-y-4">
                {included.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why free */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Why is Peck free?</h2>
          <p className="text-lg text-muted-foreground">
            We use open-source puzzles from Lichess and want to help players
            improve without financial barriers. The Woodpecker Method works—we
            built Peck so everyone can use it. No upsells, no premium tiers.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Join thousands training for free
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Create your account in seconds. No payment info needed.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 rounded-2xl font-semibold"
            >
              Get started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
