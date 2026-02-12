import type { Metadata } from "next";
import LandingPage from "./landing-page";
import {
  SITE_CONFIG,
  generatePageMetadata,
  PAGE_METADATA,
  generateWoodpeckerFAQSchema,
  generateHowToSchema,
  generateSoftwareApplicationSchema,
} from "@/lib/seo";
import {
  getPublicCompletedPuzzlesCount,
} from "@/lib/public-stats";

export const revalidate = 43200;

/**
 * Landing page metadata - Optimized for "woodpecker method" keywords
 * This is the most important page for SEO ranking
 */
export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.home),
  // Override title for homepage (no template suffix)
  title: PAGE_METADATA.home.title,
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

export default async function Page() {
  const completedPuzzlesCount = await getPublicCompletedPuzzlesCount();

  return (
    <>
      {/* 
        Structured Data for Rich Snippets
        These schemas help Google understand the page and display rich results
      */}

      {/* FAQ Schema - Targets "what is woodpecker method" queries */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWoodpeckerFAQSchema()),
        }}
      />

      {/* HowTo Schema - Targets "how to use woodpecker method" queries */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateHowToSchema()),
        }}
      />

      {/* SoftwareApplication Schema - Targets "woodpecker method app" queries */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSoftwareApplicationSchema()),
        }}
      />

      <LandingPage completedPuzzlesCount={completedPuzzlesCount} />
    </>
  );
}
