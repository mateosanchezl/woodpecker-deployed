import type { Metadata } from "next"
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.dashboard,
  noIndex: true,
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
