"use client";

import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppReviewCard } from "@/components/dashboard/app-review-card";

interface ReviewPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function ReviewPromptModal({
  open,
  onOpenChange,
  onSubmitted,
}: ReviewPromptModalProps) {
  const handleSubmitted = () => {
    if (onSubmitted) {
      onSubmitted();
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Quick check-in
          </DialogTitle>
          <DialogDescription>
            A quick rating helps us improve Peck faster.
          </DialogDescription>
        </DialogHeader>

        <AppReviewCard onSubmitted={handleSubmitted} />
      </DialogContent>
    </Dialog>
  );
}
