import type { Metadata } from "next"
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.training,
  noIndex: true,
})

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
