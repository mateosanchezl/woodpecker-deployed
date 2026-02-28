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
import { LATEST_CHANGELOG_ENTRY, formatChangelogDate } from "@/lib/changelog";
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
  const [isDismissed, setIsDismissed] = useState(() => {
    // Initialize from localStorage (will be checked again on mount for SSR)
    if (typeof window !== "undefined") {
      const dismissedVersion = localStorage.getItem(STORAGE_KEY);
      return dismissedVersion === LATEST_CHANGELOG_ENTRY.version;
    }
    return true; // Default to hidden during SSR
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this update was already dismissed
    const dismissedVersion = localStorage.getItem(STORAGE_KEY);
    const shouldShow = dismissedVersion !== LATEST_CHANGELOG_ENTRY.version;

    if (shouldShow) {
      // Small delay for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, LATEST_CHANGELOG_ENTRY.version);
    }, 300);
  };

  if (!hasMounted || isDismissed) {
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
                {LATEST_CHANGELOG_ENTRY.title}
              </CardTitle>
              <CardDescription className="text-blue-700/70 dark:text-blue-300/70">
                {formatChangelogDate(LATEST_CHANGELOG_ENTRY.date)}
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
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {LATEST_CHANGELOG_ENTRY.description}
        </p>

        {LATEST_CHANGELOG_ENTRY.features.length > 0 && (
          <ul className="space-y-2">
            {LATEST_CHANGELOG_ENTRY.features.map((feature, index) => (
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

        <div className="flex flex-col gap-2 sm:flex-row">
          {LATEST_CHANGELOG_ENTRY.learnMoreUrl &&
            LATEST_CHANGELOG_ENTRY.actionLabel && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
                onClick={() => router.push(LATEST_CHANGELOG_ENTRY.learnMoreUrl!)}
              >
                {LATEST_CHANGELOG_ENTRY.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 justify-start px-0 text-blue-700 hover:bg-transparent hover:text-blue-900 dark:text-blue-300 dark:hover:bg-transparent dark:hover:text-blue-100"
            onClick={() => router.push("/changelog")}
          >
            View all updates
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
