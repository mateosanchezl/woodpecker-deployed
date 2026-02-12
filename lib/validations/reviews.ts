import { z } from "zod";

export const appReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  headline: z
    .string()
    .trim()
    .max(80, "Headline must be 80 characters or less")
    .optional()
    .or(z.literal("")),
  comment: z.string().trim().max(600, "Review must be 600 characters or less"),
});

export type AppReviewInput = z.infer<typeof appReviewSchema>;
