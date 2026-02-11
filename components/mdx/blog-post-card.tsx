import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";

interface BlogPostCardProps {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  readingTime: number;
}

export function BlogPostCard({
  title,
  description,
  date,
  slug,
  tags,
  image,
  imageAlt,
  readingTime,
}: BlogPostCardProps) {
  return (
    <article className="group relative rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
      {image && (
        <Link
          href={`/blog/${slug}`}
          className="block overflow-hidden rounded-t-2xl"
        >
          <Image
            src={image}
            alt={imageAlt || title}
            width={800}
            height={400}
            className="aspect-[2/1] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <time dateTime={date}>{formatDate(date)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime} min read</span>
        </div>

        <Link href={`/blog/${slug}`}>
          <h2 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
            {title}
          </h2>
        </Link>

        <p className="text-muted-foreground line-clamp-2 mb-4">{description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={`/blog/tags/${tag}`}>
                <Badge
                  variant="secondary"
                  className="text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
