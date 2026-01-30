import type { Metadata } from "next";
import Link from "next/link";
import { generateSlugPageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { Button } from "@/components/ui/button";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateSlugPageMetadata({
    slug,
    pathPrefix: "/blog",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  // Shell: no content yet; return 404 or placeholder. Plan says "route shells" so show placeholder.
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: slug.replace(/-/g, " "), url: `/blog/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold tracking-tight mb-4 capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Blog post content can be added via the content pipeline later.
        </p>
        <Link href="/blog">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    </>
  );
}
