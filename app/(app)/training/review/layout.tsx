import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Review Weak Puzzles | Improve Your Tactics",
  description:
    "Review and practice the chess puzzles you've struggled with most. Step through solutions and build pattern recognition on your weakest areas.",
  path: "/training/review",
  noIndex: true,
});

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
