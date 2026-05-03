import { PlanStatus } from "@prisma/client";
import { z } from "zod";

export const PLAN_STATUS_OPTIONS = [
  PlanStatus.DRAFT,
  PlanStatus.ACTIVE,
  PlanStatus.COMPLETED,
  PlanStatus.CANCELLED,
] as const;

// HTML <input type="date"> returns ISO 8601 date strings ("YYYY-MM-DD"),
// so we keep the schema string-shaped and convert to Date inside the
// server action where we hit Prisma. This avoids any RHF/string ↔ Date
// gymnastics in the form layer.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

export const interventionPlanFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title is too long"),
    strategy: z
      .string()
      .trim()
      .min(10, "Strategy must be at least 10 characters")
      .max(2000, "Strategy is too long"),
    startDate: isoDate.min(1, "Start date is required"),
    endDate: z.union([isoDate, z.literal("")]).optional(),
    status: z.enum(PLAN_STATUS_OPTIONS, { message: "Pick a status" }),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be on or after the start date",
      path: ["endDate"],
    }
  );

export type InterventionPlanFormValues = z.infer<
  typeof interventionPlanFormSchema
>;
