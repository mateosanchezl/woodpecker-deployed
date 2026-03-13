import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  generateBreadcrumbSchema,
  generateArticleSchema,
  SITE_CONFIG,
  getAbsoluteUrl,
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

  const url = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const image = post.image
    ? {
        url: getAbsoluteUrl(post.image),
        width: 1200,
        height: 630,
        alt: post.imageAlt || post.title,
      }
    : undefined;

  return {
    title: post.title,
    description: post.description,
    keywords: [
      ...post.tags,
      "woodpecker method",
      "chess training",
      "chess tactics",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      locale: SITE_CONFIG.locale,
      siteName: SITE_CONFIG.name,
      type: "article",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      title: post.title,
      description: post.description,
      card: "summary_large_image",
      creator: SITE_CONFIG.twitterHandle,
      ...(image ? { images: [image.url] } : {}),
    },
  };
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
    image: getAbsoluteUrl(post.image || "/opengraph-image"),
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

      <article className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
            {post.title}
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground font-medium mb-8 leading-relaxed">
            {post.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            {post.updated && post.updated !== post.date && (
              <div className="flex items-center gap-2">
                <span>Updated {formatDate(post.updated)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>{Math.ceil(post.metadata.readingTime)} min read</span>
            </div>
            {post.metadata.wordCount > 0 && (
              <div className="flex items-center gap-2">
                <span>{post.metadata.wordCount.toLocaleString()} words</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Tag className="h-5 w-5 text-primary" />
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/blog/tags/${tag}`}>
                  <Badge
                    variant="secondary"
                    className="text-sm px-4 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
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
