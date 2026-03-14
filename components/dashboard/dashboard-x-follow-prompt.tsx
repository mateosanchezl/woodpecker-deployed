"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SOCIAL_LINKS } from "@/lib/site-config";

const STORAGE_KEY = "woodpecker-dashboard-x-follow-v1";
const DISMISSED_VALUE = "dismissed";
const OPEN_DELAY_MS = 1200;

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function DashboardXFollowPrompt() {
  const hasMounted = useHasMounted();
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return localStorage.getItem(STORAGE_KEY) === DISMISSED_VALUE;
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isDismissed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isDismissed]);

  const dismissPrompt = () => {
    localStorage.setItem(STORAGE_KEY, DISMISSED_VALUE);
    setIsOpen(false);
    setIsDismissed(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dismissPrompt();
      return;
    }

    setIsOpen(true);
  };

  if (!hasMounted || isDismissed) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Image
              src="/pecklogoicon.png"
              alt="Peck"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <DialogTitle className="text-2xl tracking-tight">
            Follow our new X!
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Come hang out with us at {SOCIAL_LINKS.x.handle} for product
            updates, training ideas, and community wins. Your follow helps more
            players discover Peck and makes the community stronger.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-background p-2 shadow-sm ring-1 ring-border">
              <Image
                src="/pecklogoicon.png"
                alt="Peck"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span>{SOCIAL_LINKS.x.handle}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Users className="h-3 w-3" />
                  Updates + community
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Be the first to see new features, release notes, and what we are
                building next.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={dismissPrompt}>
            No thanks
          </Button>
          <Button asChild className="gap-2">
            <a
              href={SOCIAL_LINKS.x.href}
              target="_blank"
              rel="noreferrer"
              onClick={dismissPrompt}
            >
              <Image
                src="/pecklogoicon.png"
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="object-contain"
              />
              Follow on X
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
