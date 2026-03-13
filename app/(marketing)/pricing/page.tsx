import type { Metadata } from "next";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";
import PricingPageClient from "./page-client";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.pricing),
  title: PAGE_METADATA.pricing.title,
};

export default function PricingPage() {
  return <PricingPageClient />;
}
