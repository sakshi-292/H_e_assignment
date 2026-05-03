import { z } from "zod";

export const progressNoteFormSchema = z.object({
  note: z
    .string()
    .trim()
    .min(5, "Note must be at least 5 characters")
    .max(1000, "Note is too long"),
});

export type ProgressNoteFormValues = z.infer<typeof progressNoteFormSchema>;
