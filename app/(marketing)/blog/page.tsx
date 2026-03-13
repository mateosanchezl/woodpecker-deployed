import type { Metadata } from "next";
import {
  generateBreadcrumbSchema,
  generatePageMetadata,
  PAGE_METADATA,
  SITE_CONFIG,
} from "@/lib/seo";
import { getAllTags, getPublishedPosts } from "@/lib/blog";
import BlogPageClient, { type BlogListPost } from "./page-client";

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

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Blog", url: "/blog" },
]);

export default function BlogPage() {
  const posts: BlogListPost[] = getPublishedPosts().map((post) => ({
    title: post.title,
    description: post.description,
    date: post.date,
    slug: post.slug,
    tags: post.tags,
    image: post.image,
    imageAlt: post.imageAlt,
    readingTime: Math.ceil(post.metadata.readingTime),
  }));
  const tags = getAllTags();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPageClient posts={posts} tags={tags} />
    </>
  );
}
