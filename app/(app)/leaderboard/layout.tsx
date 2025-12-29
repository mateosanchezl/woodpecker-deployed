import type { Metadata } from "next"
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.leaderboard,
  noIndex: true,
})

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
