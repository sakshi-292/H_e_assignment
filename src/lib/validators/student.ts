import { StudentStatus } from "@prisma/client";
import { z } from "zod";

// Subset of StudentStatus that teachers can set in the UI today.
// ARCHIVED is reserved for a future "archive" affordance.
export const STUDENT_FORM_STATUSES = [
  StudentStatus.ACTIVE,
  StudentStatus.NEEDS_SUPPORT,
  StudentStatus.IMPROVING,
] as const;

export const studentFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(60, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(60, "Last name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),
  grade: z
    .string()
    .trim()
    .min(1, "Grade is required")
    .max(40, "Grade is too long"),
  status: z.enum(STUDENT_FORM_STATUSES, {
    message: "Pick a valid status",
  }),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
