import type { Metadata } from "next";
import LandingPage from "./landing-page";
import {
  SITE_CONFIG,
  generatePageMetadata,
  PAGE_METADATA,
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
