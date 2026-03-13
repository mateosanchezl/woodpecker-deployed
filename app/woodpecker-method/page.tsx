import type { Metadata } from "next";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generatePageMetadata,
  PAGE_METADATA,
  SITE_CONFIG,
} from "@/lib/seo";
import WoodpeckerMethodPageClient from "./page-client";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.woodpeckerMethod),
  title: PAGE_METADATA.woodpeckerMethod.title,
};

const articleSchema = generateArticleSchema({
  title: "What is the Woodpecker Method? Complete Chess Training Guide",
  description:
    "Learn how the Woodpecker Method can transform your chess tactics through intensive puzzle repetition.",
  url: `${SITE_CONFIG.url}/woodpecker-method`,
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Woodpecker Method", url: "/woodpecker-method" },
]);

const howToSchema = generateHowToSchema();

export default function WoodpeckerMethodPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <WoodpeckerMethodPageClient />
    </>
  );
}
