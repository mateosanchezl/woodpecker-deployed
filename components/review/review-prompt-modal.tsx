"use client";

import { Mail, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppReviewCard } from "@/components/dashboard/app-review-card";

interface ReviewPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewPromptModal({
  open,
  onOpenChange,
}: ReviewPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share feedback
          </DialogTitle>
          <DialogDescription>
            Tell us what feels great and what we should improve next.
          </DialogDescription>
        </DialogHeader>

        <AppReviewCard onSubmitted={() => onOpenChange(false)} />

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Prefer email?</p>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            You can also send feedback directly and we’ll reply there.
          </p>
          <Button asChild variant="outline" className="gap-2">
            <a href="mailto:dwyc.co@gmail.com?subject=Woodpecker%20Feedback">
              <Mail className="h-4 w-4" />
              Send an email
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
