import type { Metadata } from "next"
import { generatePageMetadata, PAGE_METADATA } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.settings,
  noIndex: true,
})

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
