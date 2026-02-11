import type { Metadata } from "next";
import Link from "next/link";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
  PAGE_METADATA,
  SITE_CONFIG,
} from "@/lib/seo";
import { getPublishedPosts, getAllTags } from "@/lib/blog";
import type { Post } from "#site/content";
import { BlogPostCard } from "@/components/mdx/blog-post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Rss } from "lucide-react";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.blog),
  title: PAGE_METADATA.blog.title,
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
    types: {
      "application/rss+xml": `${SITE_CONFIG.url}/blog/rss.xml`,
    },
  },
};

export default function BlogPage() {
  const posts = getPublishedPosts();
  const tags = getAllTags();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="overflow-x-hidden">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 border-b border-border/40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-radial from-primary/10 to-transparent -z-10 pointer-events-none" />
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <BookOpen className="h-4 w-4" />
              <span>Tips &amp; guides</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Woodpecker Method &{" "}
              <span className="text-primary">chess training</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Articles and tips on the Woodpecker Method, tactical training, and
              improving your game with Peck.
            </p>
            <Link
              href="/blog/rss.xml"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Rss className="h-4 w-4" />
              RSS Feed
            </Link>
          </div>
        </section>

        {/* Tags */}
        {tags.length > 0 && (
          <section className="py-6 border-b border-border/40">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                Topics:
              </span>
              {tags.map((tag: string) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Posts grid */}
        {posts.length > 0 ? (
          <section className="py-16 sm:py-24">
            <div className="grid gap-8 sm:grid-cols-2">
              {posts.map((post: Post) => (
                <BlogPostCard
                  key={post.slug}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  slug={post.slug}
                  tags={post.tags}
                  image={post.image}
                  imageAlt={post.imageAlt}
                  readingTime={Math.ceil(post.metadata.readingTime)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="py-16 sm:py-24">
            <div className="rounded-2xl border border-border bg-muted/30 p-8 sm:p-12 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Articles coming soon</h2>
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
        )}

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
    </>
  );
}
