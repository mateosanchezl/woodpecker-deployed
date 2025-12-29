import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

/**
 * Robots.txt configuration for search engine crawlers
 * 
 * This file controls how search engines crawl and index the site.
 * Next.js automatically generates /robots.txt from this file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",           // API routes should not be indexed
          "/sign-in",        // Auth pages (low value for SEO)
          "/sign-up",        // Auth pages (low value for SEO)
          "/_next/",         // Next.js internal routes
          "/dashboard",      // Protected app pages (require auth)
          "/training",       // Protected app pages (require auth)
          "/progress",       // Protected app pages (require auth)
          "/leaderboard",    // Protected app pages (require auth)
          "/achievements",   // Protected app pages (require auth)
          "/settings",       // Protected app pages (require auth)
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
