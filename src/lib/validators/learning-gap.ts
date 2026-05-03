import { GapSeverity, GapStatus } from "@prisma/client";
import { z } from "zod";

export const GAP_SEVERITY_OPTIONS = [
  GapSeverity.LOW,
  GapSeverity.MEDIUM,
  GapSeverity.HIGH,
] as const;

export const GAP_STATUS_OPTIONS = [
  GapStatus.OPEN,
  GapStatus.IN_PROGRESS,
  GapStatus.RESOLVED,
] as const;

export const learningGapFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title is too long"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject must be at least 2 characters")
    .max(60, "Subject is too long"),
  severity: z.enum(GAP_SEVERITY_OPTIONS, {
    message: "Pick a severity",
  }),
  status: z.enum(GAP_STATUS_OPTIONS, {
    message: "Pick a status",
  }),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
});

export type LearningGapFormValues = z.infer<typeof learningGapFormSchema>;
