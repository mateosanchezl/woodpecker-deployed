"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Sparkles, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ReviewResponse {
  review: {
    id: string;
    rating: number;
    headline: string | null;
    comment: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

interface SaveReviewInput {
  rating: number;
  headline: string;
  comment: string;
}

interface AppReviewCardProps {
  onSubmitted?: () => void;
}

export function AppReviewCard({ onSubmitted }: AppReviewCardProps) {
  const [draft, setDraft] = useState<SaveReviewInput | null>(null);
  const queryClient = useQueryClient();

  const { data: existingReview, isLoading } = useQuery<ReviewResponse>({
    queryKey: ["app-review"],
    queryFn: async (): Promise<ReviewResponse> => {
      const response = await fetch("/api/reviews");
      if (!response.ok) {
        throw new Error("Failed to fetch review");
      }
      return response.json() as Promise<ReviewResponse>;
    },
  });

  const currentRating = draft?.rating ?? existingReview?.review?.rating ?? 0;
  const currentHeadline =
    draft?.headline ?? existingReview?.review?.headline ?? "";
  const currentComment =
    draft?.comment ?? existingReview?.review?.comment ?? "";

  const updateDraft = (changes: Partial<SaveReviewInput>) => {
    setDraft((previous) => ({
      rating: previous?.rating ?? existingReview?.review?.rating ?? 0,
      headline: previous?.headline ?? existingReview?.review?.headline ?? "",
      comment: previous?.comment ?? existingReview?.review?.comment ?? "",
      ...changes,
    }));
  };

  const saveReview = useMutation<ReviewResponse, Error, SaveReviewInput>({
    mutationFn: async (payload: SaveReviewInput) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to save review");
      }

      return response.json() as Promise<ReviewResponse>;
    },
    onSuccess: () => {
      toast.success(
        existingReview?.review ? "Review updated" : "Thanks for the review!",
      );
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["app-review"] });
      onSubmitted?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not save your review");
    },
  });

  const canSubmit =
    currentRating > 0 && !saveReview.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    saveReview.mutate({
      rating: currentRating,
      headline: currentHeadline,
      comment: currentComment,
    });
  };

  return (
    <Card className="border-primary/20 bg-linear-to-br from-background via-background to-muted/30">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle>Share your feedback</CardTitle>
        </div>
        <CardDescription>
          Loving Peck or seeing friction? Your review helps us improve every
          session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">How would you rate the app?</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateDraft({ rating: star })}
                className="rounded-md p-1 transition hover:scale-105"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    star <= currentRating
                      ? "fill-yellow-400 text-yellow-500"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <Input
          value={currentHeadline}
          onChange={(event) => updateDraft({ headline: event.target.value })}
          maxLength={80}
          placeholder="Optional headline"
        />

        <div className="space-y-2">
          <textarea
            value={currentComment}
            onChange={(event) => updateDraft({ comment: event.target.value })}
            maxLength={600}
            rows={4}
            placeholder="Optional comment"
            className="flex min-h-30 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="text-xs text-muted-foreground text-right">
            {currentComment.length}/600
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full sm:w-auto gap-2"
        >
          <Send className="h-4 w-4" />
          {saveReview.isPending
            ? "Saving..."
            : existingReview?.review
              ? "Update review"
              : "Submit review"}
        </Button>

        {!isLoading && existingReview?.review && (
          <p className="text-xs text-muted-foreground">
            Thanks — your latest review is saved and can be edited anytime.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
