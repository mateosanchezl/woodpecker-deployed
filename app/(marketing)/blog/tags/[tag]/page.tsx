import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { getAllTags, getPostsByTag } from "@/lib/blog";
import type { Post } from "#site/content";
import { BlogPostCard } from "@/components/mdx/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag } from "lucide-react";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((tag: string) => ({ tag }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return generatePageMetadata({
    title: `Posts tagged "${decodedTag}" | Peck Blog`,
    description: `All articles about ${decodedTag} — Woodpecker Method tips, chess training guides, and more from Peck.`,
    path: `/blog/tags/${tag}`,
    keywords: [
      decodedTag,
      "woodpecker method",
      "chess training",
      "chess tactics",
    ],
  });
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);
  const allTags = getAllTags();

  if (posts.length === 0) notFound();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: `Tag: ${decodedTag}`, url: `/blog/tags/${tag}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div>
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All posts
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Tag className="h-6 w-6 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight capitalize">
              {decodedTag}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {posts.length} {posts.length === 1 ? "article" : "articles"} tagged
            with &ldquo;{decodedTag}&rdquo;
          </p>
        </div>

        {/* Posts */}
        <div className="grid gap-8 sm:grid-cols-2 mb-16">
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

        {/* Other tags */}
        <div className="border-t border-border pt-8">
          <h2 className="text-lg font-semibold mb-4">Browse more topics</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t: string) => (
              <Link key={t} href={`/blog/tags/${t}`}>
                <Badge
                  variant={
                    t.toLowerCase() === decodedTag.toLowerCase()
                      ? "default"
                      : "outline"
                  }
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {t}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
