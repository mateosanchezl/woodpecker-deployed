import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  generatePageMetadata,
  PAGE_METADATA,
  generateArticleSchema,
  generateHowToSchema,
  generateWoodpeckerFAQSchema,
  generateBreadcrumbSchema,
  SITE_CONFIG,
} from "@/lib/seo";
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

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.woodpeckerMethod),
  title: PAGE_METADATA.woodpeckerMethod.title,
};

export default function WoodpeckerMethodPage() {
  const articleSchema = generateArticleSchema({
    title: "What is the Woodpecker Method? Complete Chess Training Guide",
    description: "Learn how the Woodpecker Method can transform your chess tactics through intensive puzzle repetition.",
    url: `${SITE_CONFIG.url}/woodpecker-method`,
    datePublished: "2024-01-01T00:00:00Z",
    dateModified: new Date().toISOString(),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Woodpecker Method", url: "/woodpecker-method" },
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateHowToSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWoodpeckerFAQSchema()) }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                P
              </div>
              <span className="font-serif">Peck</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/sign-up">
                <Button size="sm">Start Training Free</Button>
              </Link>
            </nav>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="py-16 sm:py-24 border-b border-border/40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  <BookOpen className="h-4 w-4" />
                  <span>Complete Guide</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  What is the <span className="text-primary">Woodpecker Method</span>?
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  The scientifically-proven chess training technique that builds 
                  tactical pattern recognition through intensive puzzle repetition.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/sign-up">
                    <Button size="lg" className="h-12 px-8">
                      Try Woodpecker Method Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button variant="outline" size="lg" className="h-12 px-8">
                      Learn How It Works
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* What is it Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <article className="prose prose-slate dark:prose-invert max-w-none">
                  <h2 className="text-3xl font-bold tracking-tight mb-6">
                    The Woodpecker Method Explained
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    The <strong>Woodpecker Method</strong> is a chess training technique developed by 
                    Swedish Grandmaster <strong>Axel Smith</strong> and International Master <strong>Hans Tikkanen</strong>. 
                    Published in their 2018 book, this method has helped countless players improve their 
                    tactical ability through a simple but powerful approach: <em>solve the same puzzles 
                    repeatedly until the patterns become automatic</em>.
                  </p>

                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Unlike traditional puzzle training where you solve new puzzles every day, the 
                    Woodpecker Method focuses on <strong>repetition and speed</strong>. You select a 
                    fixed set of tactical puzzles and solve them in cycles, getting faster each time. 
                    By the end of your training, patterns that once required minutes of calculation 
                    are recognized instantly.
                  </p>

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Why "Woodpecker"?
                    </h3>
                    <p className="text-muted-foreground mb-0">
                      The name comes from how woodpeckers repeatedly peck at trees with rapid, 
                      consistent strikes. Similarly, you repeatedly "peck" at the same puzzles, 
                      each time getting faster and more accurate until the patterns are burned 
                      into your chess intuition.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-16 sm:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
                  How the Woodpecker Method Works
                </h2>

                <div className="space-y-8">
                  {[
                    {
                      step: 1,
                      title: "Create Your Puzzle Set",
                      description: "Select 100-300 tactical puzzles slightly below your rating. Quality matters more than quantity. Peck automatically curates high-quality puzzles from the Lichess database.",
                      icon: Target,
                      time: "5 minutes",
                    },
                    {
                      step: 2,
                      title: "Complete Cycle 1 - Solve Carefully",
                      description: "Solve all puzzles in your set, taking time to calculate fully. Don't rush this first cycle. Understanding each pattern deeply is crucial for later speed.",
                      icon: Clock,
                      time: "45-60 minutes",
                    },
                    {
                      step: 3,
                      title: "Complete Cycle 2 - Build Speed",
                      description: "Solve the same puzzles again. You'll recognize patterns from Cycle 1 and solve faster. Aim to cut your total time in half.",
                      icon: Repeat,
                      time: "20-30 minutes",
                    },
                    {
                      step: 4,
                      title: "Cycles 3-5 - Master the Patterns",
                      description: "Continue repeating the set. Each cycle should be faster as patterns become automatic. Most users achieve 8x speed improvement by cycle 4-5.",
                      icon: Zap,
                      time: "7-15 minutes",
                    },
                    {
                      step: 5,
                      title: "Track and Analyze",
                      description: "Monitor your cycle times and accuracy. Identify problem puzzles that need extra attention. When times plateau, you've mastered the set.",
                      icon: TrendingUp,
                      time: "Ongoing",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-6 bg-background rounded-xl border border-border p-6"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-primary">Step {item.step}</span>
                          <span className="text-sm text-muted-foreground">~{item.time}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
                  Why the Woodpecker Method Works
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Pattern Recognition",
                      description: "Repeated exposure to tactical motifs trains your brain to recognize them instantly, without conscious calculation.",
                    },
                    {
                      title: "Speed Under Pressure",
                      description: "When patterns are automatic, you save time in real games for complex positions that require deep calculation.",
                    },
                    {
                      title: "Confidence Building",
                      description: "Knowing you've mastered specific patterns gives you confidence to play sharply in tactical positions.",
                    },
                    {
                      title: "Measurable Progress",
                      description: "Cycle time improvements provide concrete evidence of your growth, keeping you motivated.",
                    },
                    {
                      title: "Efficient Training",
                      description: "No time wasted on puzzles far above your level. Every puzzle contributes to building your tactical foundation.",
                    },
                    {
                      title: "Scientific Basis",
                      description: "Based on spaced repetition principles proven effective in learning research and memory science.",
                    },
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      className="bg-muted/30 rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-2">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 sm:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      q: "How many puzzles should be in a Woodpecker Method set?",
                      a: "Most players find success with 100-300 puzzles. Beginners should start with 100-150 puzzles to keep cycles manageable. The key is choosing a size you can complete in 30-60 minutes for the first cycle.",
                    },
                    {
                      q: "What rating should Woodpecker Method puzzles be?",
                      a: "Choose puzzles 100-200 points below your puzzle rating. If you're rated 1500, use puzzles around 1300-1400. Easier puzzles allow more repetitions and faster pattern internalization.",
                    },
                    {
                      q: "How many cycles should I complete?",
                      a: "Complete 4-7 cycles per puzzle set. You'll know you've mastered a set when your cycle time plateaus and you recognize patterns instantly. Then create a new set with different puzzles.",
                    },
                    {
                      q: "Is the Woodpecker Method better than solving new puzzles?",
                      a: "For tactical pattern recognition, yes. The Woodpecker Method is proven more effective than solving random puzzles because repetition builds automatic recognition. However, both approaches have value in a complete training program.",
                    },
                    {
                      q: "How long until I see improvement?",
                      a: "Most users notice improvement within 2-3 weeks of consistent Woodpecker training. Significant rating gains (100-200 points) typically occur after completing 2-3 full puzzle sets.",
                    },
                  ].map((faq, i) => (
                    <div
                      key={i}
                      className="bg-background rounded-xl border border-border p-6"
                    >
                      <h3 className="font-semibold mb-3">{faq.q}</h3>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-primary text-primary-foreground rounded-3xl p-8 sm:p-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Start Your Woodpecker Method Training
                  </h2>
                  <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                    Join thousands of chess players improving their tactics with the 
                    Woodpecker Method. Free forever, no credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/sign-up">
                      <Button size="lg" variant="secondary" className="h-12 px-8 w-full sm:w-auto">
                        Create Free Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 px-8 w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div>© {new Date().getFullYear()} Peck. All rights reserved.</div>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
                <a href="mailto:support@peckchess.com" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
