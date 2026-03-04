"use client";

import { useEffect, useState } from "react";
import { ReviewPromptModal } from "@/components/review/review-prompt-modal";

const CAMPAIGN_DATE = "2026-03-04";
const STORAGE_KEY = `woodpecker-dashboard-feedback-${CAMPAIGN_DATE}`;
const DISMISSED_VALUE = "dismissed";
const OPEN_DELAY_MS = 300;

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function DashboardFeedbackPrompt() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (getLocalDateString() !== CAMPAIGN_DATE) {
      return;
    }

    const hasDismissed = localStorage.getItem(STORAGE_KEY) === DISMISSED_VALUE;
    if (hasDismissed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsMounted(true);
      setIsOpen(true);
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem(STORAGE_KEY, DISMISSED_VALUE);
    setIsOpen(false);
    setIsMounted(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dismissPrompt();
      return;
    }

    setIsOpen(true);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <ReviewPromptModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      onSubmitted={dismissPrompt}
    />
  );
}
