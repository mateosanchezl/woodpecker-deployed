import { z } from "zod";

export const trainingBugReportSchema = z.object({
  message: z
    .string()
    .trim()
    .min(12, "Bug report must be at least 12 characters")
    .max(1200, "Bug report must be 1200 characters or less"),
  puzzleSetId: z.string().trim().min(1).nullable(),
  cycleId: z.string().trim().min(1).nullable(),
  cycleNumber: z.number().int().positive().nullable(),
  puzzleInSetId: z.string().trim().min(1).nullable(),
  puzzleId: z.string().trim().min(1).nullable(),
  puzzlePosition: z.number().int().positive().nullable(),
  isCycleComplete: z.boolean(),
  sessionError: z.string().trim().max(500).nullable(),
  currentUrl: z.string().trim().url("Current URL must be a valid URL"),
});

export type TrainingBugReportInput = z.infer<typeof trainingBugReportSchema>;
