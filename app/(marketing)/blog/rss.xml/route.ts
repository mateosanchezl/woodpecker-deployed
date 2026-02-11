import { getPublishedPosts } from "@/lib/blog";
import type { Post } from "#site/content";
import { SITE_CONFIG } from "@/lib/seo";

export async function GET() {
  const posts = getPublishedPosts();

  const itemsXml = posts
    .map(
      (post: Post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_CONFIG.url}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_CONFIG.url}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map((tag: string) => `<category>${tag}</category>`).join("\n      ")}
    </item>`,
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_CONFIG.name} Blog - Woodpecker Method &amp; Chess Training</title>
    <link>${SITE_CONFIG.url}/blog</link>
    <description>Articles and tips on the Woodpecker Method, chess tactics training, and improving your game with Peck.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_CONFIG.url}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
