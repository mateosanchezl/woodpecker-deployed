"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, X } from "lucide-react";
import {
  LATEST_CHANGELOG_ENTRY,
  formatChangelogDate,
  getUnreadChangelogEntries,
} from "@/lib/changelog";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "woodpecker-dismissed-update";

// Custom hook for safely checking mounted state without setState in useEffect
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function UpdateNotification() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const [unreadEntries, setUnreadEntries] = useState(() => {
    if (typeof window !== "undefined") {
      const dismissedVersion = localStorage.getItem(STORAGE_KEY);
      return getUnreadChangelogEntries(dismissedVersion);
    }
    return [];
  });
  const [isVisible, setIsVisible] = useState(false);
  const latestUnreadEntry = unreadEntries[0] ?? LATEST_CHANGELOG_ENTRY;
  const hasMultipleUnreadEntries = unreadEntries.length > 1;

  useEffect(() => {
    if (unreadEntries.length > 0) {
      // Small delay for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [unreadEntries.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setUnreadEntries([]);
      localStorage.setItem(STORAGE_KEY, LATEST_CHANGELOG_ENTRY.version);
    }, 300);
  };

  if (!hasMounted || unreadEntries.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 ease-out",
        "bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
        "border-blue-200 dark:border-blue-800",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                {hasMultipleUnreadEntries
                  ? `${unreadEntries.length} updates launched`
                  : latestUnreadEntry.title}
              </CardTitle>
              <CardDescription className="text-blue-700/70 dark:text-blue-300/70">
                {hasMultipleUnreadEntries
                  ? `Latest: ${formatChangelogDate(latestUnreadEntry.date)}`
                  : formatChangelogDate(latestUnreadEntry.date)}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-100 dark:hover:bg-blue-900/50"
            onClick={handleDismiss}
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasMultipleUnreadEntries ? (
          <ul className="space-y-2">
            {unreadEntries.map((entry) => (
              <li
                key={entry.version}
                className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {entry.title}
                  </p>
                  <p className="text-blue-800/80 dark:text-blue-200/80">
                    {entry.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {latestUnreadEntry.description}
            </p>

            {latestUnreadEntry.features.length > 0 && (
              <ul className="space-y-2">
                {latestUnreadEntry.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {!hasMultipleUnreadEntries &&
            latestUnreadEntry.learnMoreUrl &&
            latestUnreadEntry.actionLabel && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
                onClick={() => router.push(latestUnreadEntry.learnMoreUrl!)}
              >
                {latestUnreadEntry.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 justify-start px-0 text-blue-700 hover:bg-transparent hover:text-blue-900 dark:text-blue-300 dark:hover:bg-transparent dark:hover:text-blue-100"
            onClick={() => router.push("/changelog")}
          >
            {hasMultipleUnreadEntries ? "See what's new" : "View all updates"}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
