import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.blog),
  title: PAGE_METADATA.blog.title,
};

export default function BlogPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-border/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial from-primary/10 to-transparent -z-10 pointer-events-none" />
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <BookOpen className="h-4 w-4" />
            <span>Tips & guides</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Woodpecker Method & <span className="text-primary">chess training</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Articles and tips on the Woodpecker Method, tactical training, and
            improving your game with Peck.
          </p>
        </div>
      </section>

      {/* Coming soon / featured */}
      <section className="py-16 sm:py-24">
        <div className="rounded-2xl border border-border bg-muted/30 p-8 sm:p-12 text-center max-w-2xl mx-auto">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold mb-4">More articles coming soon</h2>
          <p className="text-muted-foreground mb-8">
            We&apos;re preparing guides on cycle planning, rating bands, and
            how to get the most from the Woodpecker Method. In the meantime,
            dive into the full guide below.
          </p>
          <Link href="/woodpecker-method">
            <Button size="lg" className="h-12 px-8 rounded-2xl">
              Read the Woodpecker Method guide
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
            Put the method into practice. Free forever.
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
