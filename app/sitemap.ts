import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

/**
 * Sitemap configuration for search engine discovery
 *
 * Optimized for ranking on "woodpecker method" and "free chess training" keywords.
 * The /woodpecker-method page is given high priority as it targets
 * our primary keyword directly.
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

  return staticPages;
}
