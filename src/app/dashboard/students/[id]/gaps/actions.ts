"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeacherId } from "@/lib/auth-helpers";
import {
  learningGapFormSchema,
  type LearningGapFormValues,
} from "@/lib/validators/learning-gap";

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof LearningGapFormValues, string>>;
    };

function flattenFieldErrors(
  parsed: ReturnType<typeof learningGapFormSchema.safeParse>
): Partial<Record<keyof LearningGapFormValues, string>> | undefined {
  if (parsed.success) return undefined;
  const flattened = parsed.error.flatten().fieldErrors;
  const result: Partial<Record<keyof LearningGapFormValues, string>> = {};
  for (const [key, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      result[key as keyof LearningGapFormValues] = messages[0];
    }
  }
  return result;
}

/**
 * Confirms the studentId belongs to the current teacher.
 * Returns the studentId on success, or null when ownership fails.
 */
async function assertOwnsStudent(
  studentId: string,
  teacherId: string
): Promise<string | null> {
  const student = await prisma.student.findFirst({
    where: { id: studentId, teacherId },
    select: { id: true },
  });
  return student?.id ?? null;
}

export async function createLearningGap(
  studentId: string,
  values: LearningGapFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}/gaps/new`
  );

  const ownedStudentId = await assertOwnsStudent(studentId, teacherId);
  if (!ownedStudentId) {
    return { ok: false, error: "Student not found." };
  }

  const parsed = learningGapFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  try {
    await prisma.learningGap.create({
      data: { ...parsed.data, studentId: ownedStudentId },
    });
  } catch (error) {
    console.error("createLearningGap failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}`);
}

export async function updateLearningGap(
  studentId: string,
  gapId: string,
  values: LearningGapFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}/gaps/${gapId}/edit`
  );

  const ownedStudentId = await assertOwnsStudent(studentId, teacherId);
  if (!ownedStudentId) {
    return { ok: false, error: "Student not found." };
  }

  const parsed = learningGapFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  let updated: { count: number };
  try {
    // updateMany with both ids ensures the gap is tied to this student.
    updated = await prisma.learningGap.updateMany({
      where: { id: gapId, studentId: ownedStudentId },
      data: parsed.data,
    });
  } catch (error) {
    console.error("updateLearningGap failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (updated.count === 0) {
    return { ok: false, error: "Learning gap not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}`);
}

export async function deleteLearningGap(
  studentId: string,
  gapId: string
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}`
  );

  const ownedStudentId = await assertOwnsStudent(studentId, teacherId);
  if (!ownedStudentId) {
    return { ok: false, error: "Student not found." };
  }

  let deleted: { count: number };
  try {
    deleted = await prisma.learningGap.deleteMany({
      where: { id: gapId, studentId: ownedStudentId },
    });
  } catch (error) {
    console.error("deleteLearningGap failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (deleted.count === 0) {
    return { ok: false, error: "Learning gap not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
  return { ok: true };
}
