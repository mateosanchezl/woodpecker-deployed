import type { Metadata } from 'next'
import { generatePageMetadata, PAGE_METADATA } from '@/lib/seo'

export const metadata: Metadata = generatePageMetadata({
  ...PAGE_METADATA.support,
  noIndex: true,
})

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
