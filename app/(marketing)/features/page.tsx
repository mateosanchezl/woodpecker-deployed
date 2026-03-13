import type { Metadata } from "next";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";
import FeaturesPageClient from "./page-client";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.features),
  title: PAGE_METADATA.features.title,
};

export default function FeaturesPage() {
  return <FeaturesPageClient />;
}
