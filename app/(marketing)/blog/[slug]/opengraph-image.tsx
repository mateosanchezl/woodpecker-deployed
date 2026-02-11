import { ImageResponse } from "next/og";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog";
import type { Post } from "#site/content";

export const alt = "Peck Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPublishedPosts().map((post: Post) => ({ slug: post.slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? slug.replace(/-/g, " ");
  const description = post?.description ?? "";
  const date = post
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0a0a0a",
        padding: "60px 80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Top: badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            backgroundColor: "#16a34a",
            color: "white",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Peck Blog
        </div>
        {date && (
          <div style={{ color: "#a1a1aa", fontSize: "16px" }}>{date}</div>
        )}
      </div>

      {/* Middle: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: "22px",
              color: "#a1a1aa",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {description.length > 120
              ? description.slice(0, 120) + "…"
              : description}
          </div>
        )}
      </div>

      {/* Bottom: branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          🐦 Peck — Free Woodpecker Method
        </div>
        <div style={{ color: "#71717a", fontSize: "16px" }}>peckchess.com</div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
