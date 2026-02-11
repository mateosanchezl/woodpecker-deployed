import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
  generateArticleSchema,
  SITE_CONFIG,
} from "@/lib/seo";
import { getPostBySlug, getPublishedPosts, formatDate } from "@/lib/blog";
import type { Post } from "#site/content";
import { MDXContent } from "@/components/mdx/mdx-content";
import { TableOfContents } from "@/components/mdx/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  return posts.map((post: Post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return generatePageMetadata({
    title: `${post.title} | Peck Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: [
      ...post.tags,
      "woodpecker method",
      "chess training",
      "chess tactics",
    ],
    openGraph: {
      type: "article",
      images: post.image
        ? [{ url: post.image, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description,
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    image: post.image
      ? `${SITE_CONFIG.url}${post.image}`
      : `${SITE_CONFIG.url}/og-image.png`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {post.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            {post.updated && post.updated !== post.date && (
              <div className="flex items-center gap-1.5">
                <span>Updated {formatDate(post.updated)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{Math.ceil(post.metadata.readingTime)} min read</span>
            </div>
            {post.metadata.wordCount > 0 && (
              <span>{post.metadata.wordCount.toLocaleString()} words</span>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Table of Contents */}
        {post.toc && post.toc.length > 0 && <TableOfContents toc={post.toc} />}

        {/* Content */}
        <div className="mt-10">
          <MDXContent code={post.body} />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All posts
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start training free</Button>
            </Link>
          </div>
        </footer>
      </article>
    </>
  );
}
