import type { Metadata } from "next"
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.achievements,
  noIndex: true,
})

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
