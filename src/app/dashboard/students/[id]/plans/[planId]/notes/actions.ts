"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeacherId } from "@/lib/auth-helpers";
import {
  progressNoteFormSchema,
  type ProgressNoteFormValues,
} from "@/lib/validators/progress-note";

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof ProgressNoteFormValues, string>>;
    };

function flattenFieldErrors(
  parsed: ReturnType<typeof progressNoteFormSchema.safeParse>
): Partial<Record<keyof ProgressNoteFormValues, string>> | undefined {
  if (parsed.success) return undefined;
  const flattened = parsed.error.flatten().fieldErrors;
  const result: Partial<Record<keyof ProgressNoteFormValues, string>> = {};
  for (const [key, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      result[key as keyof ProgressNoteFormValues] = messages[0];
    }
  }
  return result;
}

/**
 * Returns the planId iff the plan belongs to the given student AND the
 * student belongs to the given teacher. Returns null otherwise.
 *
 * One round-trip; the composite WHERE encodes the full ownership chain
 * (teacher → student → plan).
 */
async function assertOwnsPlan(
  studentId: string,
  planId: string,
  teacherId: string
): Promise<string | null> {
  const plan = await prisma.interventionPlan.findFirst({
    where: {
      id: planId,
      studentId,
      student: { teacherId },
    },
    select: { id: true },
  });
  return plan?.id ?? null;
}

function revalidate(studentId: string, planId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
  revalidatePath(`/dashboard/students/${studentId}/plans/${planId}`);
}

export async function createProgressNote(
  studentId: string,
  planId: string,
  values: ProgressNoteFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}/plans/${planId}`
  );

  const ownedPlanId = await assertOwnsPlan(studentId, planId, teacherId);
  if (!ownedPlanId) {
    return { ok: false, error: "Intervention plan not found." };
  }

  const parsed = progressNoteFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  try {
    await prisma.progressNote.create({
      data: {
        note: parsed.data.note,
        studentId,
        interventionPlanId: ownedPlanId,
      },
    });
  } catch (error) {
    console.error("createProgressNote failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  revalidate(studentId, ownedPlanId);
  return { ok: true };
}

export async function updateProgressNote(
  studentId: string,
  planId: string,
  noteId: string,
  values: ProgressNoteFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}/plans/${planId}/notes/${noteId}/edit`
  );

  const ownedPlanId = await assertOwnsPlan(studentId, planId, teacherId);
  if (!ownedPlanId) {
    return { ok: false, error: "Intervention plan not found." };
  }

  const parsed = progressNoteFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  let updated: { count: number };
  try {
    // Composite filter ensures the note belongs to this plan AND this student.
    updated = await prisma.progressNote.updateMany({
      where: { id: noteId, interventionPlanId: ownedPlanId, studentId },
      data: { note: parsed.data.note },
    });
  } catch (error) {
    console.error("updateProgressNote failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (updated.count === 0) {
    return { ok: false, error: "Progress note not found." };
  }

  revalidate(studentId, ownedPlanId);
  redirect(`/dashboard/students/${studentId}/plans/${ownedPlanId}`);
}

export async function deleteProgressNote(
  studentId: string,
  planId: string,
  noteId: string
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}/plans/${planId}`
  );

  const ownedPlanId = await assertOwnsPlan(studentId, planId, teacherId);
  if (!ownedPlanId) {
    return { ok: false, error: "Intervention plan not found." };
  }

  let deleted: { count: number };
  try {
    // Composite filter ensures the note belongs to this plan AND this student.
    deleted = await prisma.progressNote.deleteMany({
      where: { id: noteId, interventionPlanId: ownedPlanId, studentId },
    });
  } catch (error) {
    console.error("deleteProgressNote failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (deleted.count === 0) {
    return { ok: false, error: "Progress note not found." };
  }

  revalidate(studentId, ownedPlanId);
  return { ok: true };
}
