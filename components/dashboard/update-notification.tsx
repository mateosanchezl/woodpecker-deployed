"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Update this object when you want to announce a new update
// Increment the version to show the notification to users who dismissed the previous one
export const CURRENT_UPDATE = {
  version: "1.2.0",
  title: "Faster Start, First Puzzle in Seconds",
  description:
    "We streamlined onboarding so you can jump straight into training without the long setup.",
  features: [
    "Quick Start builds a starter puzzle set automatically",
    "Your first cycle starts immediately—no extra clicks",
    "Customize your set size, rating, and cycles anytime",
  ],
  date: "2026-02-03",
  learnMoreUrl: "/training",
};

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
  const hasMounted = useHasMounted();
  const [isDismissed, setIsDismissed] = useState(() => {
    // Initialize from localStorage (will be checked again on mount for SSR)
    if (typeof window !== "undefined") {
      const dismissedVersion = localStorage.getItem(STORAGE_KEY);
      return dismissedVersion === CURRENT_UPDATE.version;
    }
    return true; // Default to hidden during SSR
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this update was already dismissed
    const dismissedVersion = localStorage.getItem(STORAGE_KEY);
    const shouldShow = dismissedVersion !== CURRENT_UPDATE.version;

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
      localStorage.setItem(STORAGE_KEY, CURRENT_UPDATE.version);
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
                {CURRENT_UPDATE.title}
              </CardTitle>
              <CardDescription className="text-blue-700/70 dark:text-blue-300/70">
                {new Date(CURRENT_UPDATE.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
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
          {CURRENT_UPDATE.description}
        </p>

        {CURRENT_UPDATE.features.length > 0 && (
          <ul className="space-y-2">
            {CURRENT_UPDATE.features.map((feature, index) => (
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

        {CURRENT_UPDATE.learnMoreUrl && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
            onClick={() => window.open(CURRENT_UPDATE.learnMoreUrl, "_blank")}
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
