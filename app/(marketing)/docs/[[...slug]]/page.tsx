import type { Metadata } from "next";
import Link from "next/link";
import {
  generateSlugPageMetadata,
  generateBreadcrumbSchema,
  PAGE_METADATA,
} from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Target, Zap, TrendingUp } from "lucide-react";

interface DocsPageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = Array.isArray(slug) && slug.length > 0 ? slug.join("/") : "";
  return generateSlugPageMetadata({
    slug: slugPath,
    pathPrefix: "/docs",
  });
}

function buildBreadcrumbItems(slug: string[] | undefined) {
  const items = [
    { name: "Home", url: "/" },
    { name: "Docs", url: "/docs" },
  ];
  if (Array.isArray(slug) && slug.length > 0) {
    let path = "/docs";
    for (let i = 0; i < slug.length; i++) {
      path += `/${slug[i]}`;
      items.push({
        name: slug[i].replace(/-/g, " "),
        url: path,
      });
    }
  }
  return items;
}

const docSections = [
  {
    title: "Getting started",
    description: "Learn the Woodpecker Method and how to use Peck.",
    icon: BookOpen,
    links: [
      { label: "What is the Woodpecker Method?", href: "/woodpecker-method" },
      { label: "Creating your first puzzle set", href: "/training/new" },
    ],
  },
  {
    title: "Training",
    description: "Cycles, sets, and how to train effectively.",
    icon: Target,
    links: [
      { label: "Start training", href: "/training" },
      { label: "Choosing puzzle rating and size", href: "/woodpecker-method#how-it-works" },
    ],
  },
  {
    title: "Progress & analytics",
    description: "Track improvement and find problem puzzles.",
    icon: TrendingUp,
    links: [
      { label: "Progress dashboard", href: "/progress" },
      { label: "Cycle times and accuracy", href: "/woodpecker-method" },
    ],
  },
  {
    title: "Motivation",
    description: "Streaks, achievements, and leaderboards.",
    icon: Zap,
    links: [
      { label: "Achievements", href: "/achievements" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
];

export default async function DocPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const slugPath = Array.isArray(slug) && slug.length > 0 ? slug.join("/") : "";
  const breadcrumbSchema = generateBreadcrumbSchema(buildBreadcrumbItems(slug));
  const title =
    slugPath === ""
      ? "Documentation"
      : (slug ?? []).map((s) => s.replace(/-/g, " ")).join(" · ");
  const isIndex = slugPath === "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="overflow-x-hidden">
        {isIndex ? (
          <>
            {/* Docs index hero */}
            <section className="relative py-16 sm:py-24 border-b border-border/40">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial from-primary/10 to-transparent -z-10 pointer-events-none" />
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  <BookOpen className="h-4 w-4" />
                  <span>Guides & help</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Peck <span className="text-primary">documentation</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-10">
                  {PAGE_METADATA.docs.description}
                </p>
              </div>
            </section>

            {/* Doc sections */}
            <section className="py-16 sm:py-24">
              <div className="grid sm:grid-cols-2 gap-6">
                {docSections.map((section, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-6 sm:p-8 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <section.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-2">{section.title}</h2>
                        <p className="text-muted-foreground mb-6">
                          {section.description}
                        </p>
                        <ul className="space-y-2">
                          {section.links.map((link, j) => (
                            <li key={j}>
                              <Link
                                href={link.href}
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                              >
                                {link.label}
                                <ArrowRight className="h-4 w-4" />
                              </Link>
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
                  Ready to train?
                </h2>
                <p className="text-primary-foreground/80 mb-8">
                  Create your free account and start your first Woodpecker cycle.
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
          </>
        ) : (
          <div className="py-16 sm:py-24">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h1 className="text-4xl font-bold tracking-tight mb-4 capitalize">
                {title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Doc page content can be added via the content pipeline later.
              </p>
              <Link href="/docs">
                <Button variant="outline">Back to Docs</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
