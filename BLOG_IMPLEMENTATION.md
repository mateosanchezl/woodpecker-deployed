# Blog Implementation Documentation

**Date**: February 11, 2026  
**Purpose**: SEO-optimized blog for Peck's Next.js 16 app to improve search rankings

## Overview

A complete MDX-based blog system built with Velite for content management, optimized for SEO with dynamic metadata, structured data (JSON-LD), RSS feeds, dynamic OG images, and full sitemap integration.

## Tech Stack

- **Velite** — Build-time MDX content processor with Zod schema validation
- **MDX** — Markdown with React components
- **Rehype/Remark Plugins**:
  - `remark-gfm` — GitHub Flavored Markdown (tables, strikethrough)
  - `rehype-slug` — Auto-generate heading IDs
  - `rehype-autolink-headings` — Linkable headings
  - `rehype-pretty-code` — Shiki syntax highlighting (GitHub light/dark themes)
- **@tailwindcss/typography** — Beautiful prose styling for MDX content

## Architecture

### Content Pipeline

```
content/blog/*.mdx
     ↓
  Velite (build-time)
     ↓
  .velite/posts.json (generated, typed)
     ↓
  Next.js pages import via #site/content
```

### File Structure

```
content/blog/                          # MDX blog posts
  ├── what-is-the-woodpecker-method.mdx
  ├── common-woodpecker-method-mistakes.mdx
  └── chess-training-routine-woodpecker-method.mdx

lib/
  ├── blog.ts                          # Blog utilities (getPublishedPosts, etc.)
  └── seo.ts                           # SEO helpers (already existed)

components/mdx/
  ├── mdx-content.tsx                  # MDX renderer with prose styling
  ├── callout.tsx                      # Info/warning/tip/success callouts
  ├── chess-diagram.tsx                # Interactive chessboard component
  ├── blog-post-card.tsx               # Post card for index/archives
  └── table-of-contents.tsx            # Auto-generated TOC from headings

app/(marketing)/blog/
  ├── page.tsx                         # Blog index
  ├── [slug]/
  │   ├── page.tsx                     # Individual blog post
  │   └── opengraph-image.tsx          # Dynamic OG image per post
  ├── tags/[tag]/
  │   └── page.tsx                     # Tag archive pages
  └── rss.xml/
      └── route.ts                     # RSS 2.0 feed

velite.config.ts                       # Velite configuration
velite.d.ts                            # TypeScript declarations
.velite/                               # Generated (gitignored)
  ├── posts.json                       # Compiled blog data
  ├── index.js                         # Export module
  └── index.d.ts                       # Types
```

## SEO Features

### Per-Post SEO

Each blog post automatically generates:

- ✅ **Metadata** — Title, description, keywords, canonical URL
- ✅ **OpenGraph** — Article type, image, title, description
- ✅ **Twitter Cards** — Summary with large image
- ✅ **Article JSON-LD** — Structured data for search engines
- ✅ **Breadcrumb JSON-LD** — Navigation breadcrumbs
- ✅ **Dynamic OG Images** — Generated per-post with title/date
- ✅ **Reading Time** — Auto-calculated from word count
- ✅ **Last Modified Dates** — `updated` field in frontmatter

### Site-Wide Blog SEO

- ✅ **RSS Feed** — `/blog/rss.xml` with Atom self-link
- ✅ **Sitemap** — All posts + tag pages dynamically added to `/sitemap.xml`
- ✅ **Robots.txt** — Blog added to AI crawler allow-lists
- ✅ **LLMs.txt** — Blog referenced for AI discoverability
- ✅ **Tag Archives** — `/blog/tags/[tag]` for topical authority
- ✅ **Internal Linking** — Cross-links to `/sign-up`, `/woodpecker-method`, etc.

## Configuration

### Velite Config (`velite.config.ts`)

```typescript
const posts = defineCollection({
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s.object({
    title: s.string().max(120),
    description: s.string().max(260),
    slug: s.slug("blog"),
    date: s.isodate(),
    updated: s.isodate().optional(),
    published: s.boolean().default(true),
    tags: s.array(s.string()).default([]),
    image: s.string().optional(),
    imageAlt: s.string().optional(),
    author: s.string().default("Peck"),
    body: s.mdx(),
    toc: s.toc(), // Auto-generated table of contents
    metadata: s.metadata(), // Reading time, word count
  }),
});
```

### Next.js Integration

Velite runs automatically during:

- `npm run dev` — watches for content changes
- `npm run build` — compiles content for production

## Writing Blog Posts

### Frontmatter Template

```yaml
---
title: "Your Post Title (Max 120 chars)"
description: "SEO description (max 260 chars)"
slug: your-post-slug
date: "2026-02-11"
updated: "2026-02-15" # Optional
published: true
tags:
  - woodpecker method
  - chess training
  - tactics
image: /blog/your-image.png # Optional
imageAlt: "Alt text" # Optional
author: "Peck" # Optional, defaults to "Peck"
---
```

### Available MDX Components

#### Callout Boxes

```mdx
<Callout type="info" title="Optional Title">
  Your content here
</Callout>
```

Types: `info` (blue), `warning` (amber), `tip` (emerald), `success` (green)

#### Chess Diagrams

```mdx
<ChessDiagram
  fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  caption="Starting position"
  width={400}
/>
```

#### Standard Markdown

- **Headers** (h1-h6) — Auto-linked with IDs
- **Lists** (ordered/unordered)
- **Tables** (via GFM)
- **Code blocks** with syntax highlighting
- **Images** — Auto-optimized by Next.js
- **Links** — Internal and external

### Example Post

```mdx
---
title: "How to Improve at Chess"
description: "Practical tips for rapid chess improvement"
slug: improve-at-chess
date: "2026-02-11"
published: true
tags:
  - chess improvement
  - training
---

## Introduction

Your content starts here...

<Callout type="tip">Pro tip: Train consistently!</Callout>

### Sub-section

More content...
```

## API Reference

### `lib/blog.ts`

```typescript
// Get all published posts, sorted newest first
getPublishedPosts(): Post[]

// Get a single post by slug (or undefined)
getPostBySlug(slug: string): Post | undefined

// Get all unique tags, sorted alphabetically
getAllTags(): string[]

// Get all posts with a specific tag
getPostsByTag(tag: string): Post[]

// Format ISO date string for display
formatDate(dateString: string): string
```

### Post Type

```typescript
interface Post {
  title: string;
  description: string;
  slug: string;
  date: string; // ISO date
  updated?: string; // ISO date
  published: boolean;
  tags: string[];
  image?: string;
  imageAlt?: string;
  author: string;
  body: string; // Compiled MDX code
  toc: TocEntry[]; // Table of contents
  metadata: {
    readingTime: number; // Minutes
    wordCount: number;
  };
  permalink: string; // /blog/{slug}
}
```

## Build Output

The production build generates:

- **3 static blog posts** (SSG)
- **3 dynamic OG images** (SSG)
- **7 tag archive pages** (SSG)
- **1 RSS feed** (dynamic route)
- **Sitemap entries** for all posts + tags

### Build Stats

```
Route (app)
├ ○ /blog                              # Blog index
├ ● /blog/[slug]                       # Blog posts (3 generated)
│ ├ /blog/what-is-the-woodpecker-method
│ ├ /blog/common-woodpecker-method-mistakes
│ └ /blog/chess-training-routine-woodpecker-method
├ ● /blog/[slug]/opengraph-image       # OG images (3 generated)
├ ƒ /blog/rss.xml                      # RSS feed (dynamic)
└ ● /blog/tags/[tag]                   # Tag pages (7 generated)
```

## SEO Checklist

- [x] Title tags optimized for keywords
- [x] Meta descriptions under 260 characters
- [x] H1-H6 hierarchy correct
- [x] Internal linking to `/sign-up`, `/woodpecker-method`, `/features`
- [x] OpenGraph images (1200×630)
- [x] Article structured data (JSON-LD)
- [x] Breadcrumb structured data (JSON-LD)
- [x] Canonical URLs set
- [x] RSS feed published
- [x] Sitemap includes all posts
- [x] Reading time displayed
- [x] Publish dates in metadata
- [x] Tags for topical authority
- [x] Mobile-responsive design
- [x] Fast load times (SSG)

## Content Strategy

### Existing Posts (3)

1. **What is the Woodpecker Method?** — Educational guide targeting primary keyword
2. **5 Common Mistakes** — Practical tips, internal links
3. **How to Build a Training Routine** — Weekly plan, comprehensive

### Recommended Future Topics

- "Woodpecker Method: Beginner's Cycle 1 Walkthrough"
- "Best Puzzle Ratings for Your Skill Level"
- "How Long Should Each Woodpecker Cycle Take?"
- "Woodpecker Method vs Spaced Repetition Apps"
- "Tracking Your Chess Improvement with Cycle Times"
- "When to Move to a New Puzzle Set"
- "Chess Tactical Themes: What to Focus On"
- "Free vs Paid Chess Training: Does the Woodpecker Method Work?"

Target keywords: `woodpecker method`, `free woodpecker method`, `chess training`, `chess tactics`, `puzzle repetition`

## Maintenance

### Adding a New Post

1. Create `content/blog/your-slug.mdx`
2. Add frontmatter (see template above)
3. Write content using MDX
4. Run `npx velite build` to verify (or just `npm run dev`)
5. Build automatically includes it in sitemap, RSS, and blog index

### Updating Existing Post

1. Edit the `.mdx` file in `content/blog/`
2. Update the `updated` field in frontmatter
3. Changes reflected immediately in dev, or on next build

### Deleting a Post

1. Delete the `.mdx` file or set `published: false`
2. Next build will exclude it from all pages

## Performance

- **Static Generation** — All posts pre-rendered at build time
- **Image Optimization** — Next.js automatically optimizes images
- **Code Splitting** — `react-chessboard` loaded only when needed (dynamic import)
- **Font Optimization** — Geist + Lora preloaded
- **Syntax Highlighting** — Shiki runs at build time (no runtime cost)

## Dependencies

### Added in This Implementation

```json
{
  "dependencies": {
    "velite": "latest",
    "rehype-slug": "latest",
    "rehype-autolink-headings": "latest",
    "rehype-pretty-code": "latest",
    "remark-gfm": "latest",
    "shiki": "latest",
    "@tailwindcss/typography": "latest"
  }
}
```

### Already Installed (Used)

- `next` 16.1.1 — App Router with streaming metadata
- `react` 19.2.3 — Latest React
- `react-chessboard` — Chess diagram component
- `zod` 4.2.1 — Schema validation (Velite uses this)
- `tailwindcss` 4.x — Styling

## Future Enhancements

### Potential Additions

- [ ] **Search** — Full-text search across blog posts
- [ ] **Related Posts** — Show similar posts at end of articles
- [ ] **Comments** — Giscus or similar integration
- [ ] **Newsletter Signup** — Capture emails from blog readers
- [ ] **View Counts** — Track post popularity
- [ ] **Series/Collections** — Group related posts
- [ ] **Author Pages** — If multiple authors added
- [ ] **Code Copy Buttons** — One-click copy for code blocks
- [ ] **Estimated Read Progress** — Progress bar at top
- [ ] **Dark Mode Syntax** — Better code highlighting in dark mode
- [ ] **Draft Previews** — Preview unpublished posts in dev

### SEO Enhancements

- [ ] **Schema Markup Validation** — Test with Google Rich Results
- [ ] **Keyword Tracking** — Monitor rankings for target keywords
- [ ] **Internal Linking Audit** — Ensure all posts cross-link
- [ ] **Image Alt Text Review** — Verify all images have descriptive alt text
- [ ] **Core Web Vitals** — Monitor LCP, FID, CLS
- [ ] **Backlink Strategy** — Outreach to chess blogs/forums

## Resources

- [Velite Documentation](https://velite.js.org/)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Schema.org Article](https://schema.org/Article)
- [Google Search Central](https://developers.google.com/search)
- [MDX Documentation](https://mdxjs.com/)

---

**Implementation Status**: ✅ Complete  
**Build Status**: ✅ Passing  
**SEO Status**: ✅ Optimized  
**Content Status**: 3 seed posts published
