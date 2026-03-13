import type { Metadata } from "next";
import {
  generateFAQSchema,
  generatePageMetadata,
  PAGE_METADATA,
} from "@/lib/seo";
import { faqs } from "./faq-data";
import FAQPageClient from "./page-client";

export const metadata: Metadata = {
  ...generatePageMetadata(PAGE_METADATA.faq),
  title: PAGE_METADATA.faq.title,
};

const faqSchema = generateFAQSchema(
  faqs.map((faq) => ({
    question: faq.q,
    answer: faq.a,
  })),
);

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQPageClient />
    </>
  );
}
