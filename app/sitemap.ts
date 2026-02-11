import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import { getPublishedPosts, getAllTags } from "@/lib/blog";
import type { Post } from "#site/content";

/**
 * Sitemap configuration for search engine discovery
 *
 * Optimized for ranking on "woodpecker method" and "free chess training" keywords.
 * The /woodpecker-method page is given high priority as it targets
 * our primary keyword directly.
 *
 * Blog posts are dynamically included from the Velite content pipeline.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Woodpecker Method educational page - critical for keyword ranking
    {
      url: `${baseUrl}/woodpecker-method`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // LLMs.txt - helps AI understand our free service
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Public marketing pages (Phase 1 SEO)
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Legal pages - low priority but needed for trust
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic blog post pages
  const posts = getPublishedPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post: Post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Tag archive pages
  const tags = getAllTags();
  const tagPages: MetadataRoute.Sitemap = tags.map((tag: string) => ({
    url: `${baseUrl}/blog/tags/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticPages, ...blogPages, ...tagPages];
}
