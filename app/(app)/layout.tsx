import type { Metadata } from "next";
import { Suspense } from "react";
import { XIcon } from "@/components/icons/x-icon";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { SOCIAL_LINKS } from "@/lib/site-config";

/**
 * Metadata for protected app pages
 * These pages are behind authentication and should not be indexed
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Suspense fallback={<div className="min-w-0 flex-1" />}>
              <AppHeader />
            </Suspense>
            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        <footer className="border-t px-4 py-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>Peck Chess</span>
            <span aria-hidden="true">•</span>
            <a
              href={SOCIAL_LINKS.x.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Follow Peck on X (${SOCIAL_LINKS.x.handle})`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <XIcon className="size-3.5" />
              <span>{SOCIAL_LINKS.x.handle}</span>
            </a>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
