import type { MetadataRoute } from "next";
import { SITE_CONFIG, getAbsoluteUrl } from "@/lib/seo";
import { getPublishedPosts, getAllTags } from "@/lib/blog";
import type { Post } from "#site/content";

function getPostTimestamp(post: Post): number {
  return new Date(post.updated || post.date).getTime();
}

function getLatestDate(posts: Post[]): Date | undefined {
  if (posts.length === 0) return undefined;
  return new Date(Math.max(...posts.map(getPostTimestamp)));
}

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
  const defaultPageImage = getAbsoluteUrl("/opengraph-image");
  const posts = getPublishedPosts();
  const latestBlogDate = getLatestDate(posts);

  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [defaultPageImage],
    },
    // Woodpecker Method educational page - critical for keyword ranking
    {
      url: `${baseUrl}/woodpecker-method`,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [defaultPageImage],
    },
    // LLMs.txt - helps AI understand our free service
    {
      url: `${baseUrl}/llms.txt`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Public marketing pages (Phase 1 SEO)
    {
      url: `${baseUrl}/features`,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [defaultPageImage],
    },
    {
      url: `${baseUrl}/pricing`,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [defaultPageImage],
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
      images: [defaultPageImage],
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [defaultPageImage],
    },
    {
      url: `${baseUrl}/blog`,
      ...(latestBlogDate ? { lastModified: latestBlogDate } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
      images: [defaultPageImage],
    },
    {
      url: `${baseUrl}/docs`,
      changeFrequency: "monthly",
      priority: 0.6,
      images: [defaultPageImage],
    },
    // Legal pages - low priority but needed for trust
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic blog post pages
  const blogPages: MetadataRoute.Sitemap = posts.map((post: Post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: "monthly",
    priority: 0.6,
    images: [getAbsoluteUrl(post.image || "/opengraph-image")],
  }));

  // Tag archive pages
  const tags = getAllTags();
  const tagPages: MetadataRoute.Sitemap = tags.map((tag: string) => {
    const postsForTag = posts.filter((post) => post.tags.includes(tag));
    const latestTagDate = getLatestDate(postsForTag);

    return {
      url: `${baseUrl}/blog/tags/${encodeURIComponent(tag)}`,
      ...(latestTagDate ? { lastModified: latestTagDate } : {}),
      changeFrequency: "weekly",
      priority: 0.4,
    };
  });

  return [...staticPages, ...blogPages, ...tagPages];
}
