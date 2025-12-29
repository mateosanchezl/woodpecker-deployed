import type { Metadata } from "next"
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.trainingNew,
  noIndex: true,
})

export default function NewTrainingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
