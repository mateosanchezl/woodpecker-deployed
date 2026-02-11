"use client";

import { cn } from "@/lib/utils";

interface TocEntry {
  title: string;
  url: string;
  items?: TocEntry[];
}

interface TableOfContentsProps {
  toc: TocEntry[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  if (!toc.length) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-lg border border-border bg-muted/30 p-4 not-prose"
    >
      <p className="text-sm font-semibold mb-3">On this page</p>
      <ul className="space-y-1.5 text-sm">
        {toc.map((item) => (
          <TocItem key={item.url} item={item} depth={0} />
        ))}
      </ul>
    </nav>
  );
}

function TocItem({ item, depth }: { item: TocEntry; depth: number }) {
  return (
    <li>
      <a
        href={item.url}
        className={cn(
          "block text-muted-foreground hover:text-foreground transition-colors py-0.5",
          depth > 0 && "pl-4",
        )}
      >
        {item.title}
      </a>
      {item.items && item.items.length > 0 && (
        <ul className="space-y-1">
          {item.items.map((child) => (
            <TocItem key={child.url} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
