import type { Metadata } from "next"
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.progress,
  noIndex: true,
})

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
