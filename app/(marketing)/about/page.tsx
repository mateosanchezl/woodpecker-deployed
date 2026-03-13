import type { Metadata } from "next";
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo";
import AboutPageClient from "./page-client";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.about),
  title: PAGE_METADATA.about.title,
};

export default function AboutPage() {
  return <AboutPageClient />;
}
