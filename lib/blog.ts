import { posts } from "#site/content";
import type { Post } from "#site/content";

/**
 * Get all published blog posts, sorted by date (newest first).
 */
export function getPublishedPosts(): Post[] {
  return posts
    .filter((post: Post) => post.published)
    .sort(
      (a: Post, b: Post) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

/**
 * Get a single post by slug. Returns undefined if not found or not published.
 */
export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post: Post) => post.slug === slug && post.published);
}

/**
 * Get all unique tags from published posts, sorted alphabetically.
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  getPublishedPosts().forEach((post: Post) => {
    post.tags.forEach((tag: string) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get all published posts that have a specific tag.
 */
export function getPostsByTag(tag: string): Post[] {
  return getPublishedPosts().filter((post: Post) =>
    post.tags.map((t: string) => t.toLowerCase()).includes(tag.toLowerCase()),
  );
}

/**
 * Format a date string for display (e.g. "February 11, 2026").
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
