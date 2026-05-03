"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeacherId } from "@/lib/auth-helpers";
import {
  interventionPlanFormSchema,
  type InterventionPlanFormValues,
} from "@/lib/validators/intervention-plan";

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof InterventionPlanFormValues, string>>;
    };

function flattenFieldErrors(
  parsed: ReturnType<typeof interventionPlanFormSchema.safeParse>
): Partial<Record<keyof InterventionPlanFormValues, string>> | undefined {
  if (parsed.success) return undefined;
  const flattened = parsed.error.flatten().fieldErrors;
  const result: Partial<Record<keyof InterventionPlanFormValues, string>> = {};
  for (const [key, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      result[key as keyof InterventionPlanFormValues] = messages[0];
    }
  }
  return result;
}

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

function toPrismaData(values: InterventionPlanFormValues) {
  return {
    title: values.title,
    strategy: values.strategy,
    status: values.status,
    startDate: new Date(values.startDate),
    endDate: values.endDate ? new Date(values.endDate) : null,
  };
}

export async function createInterventionPlan(
  studentId: string,
  values: InterventionPlanFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}/plans/new`
  );

  const ownedStudentId = await assertOwnsStudent(studentId, teacherId);
  if (!ownedStudentId) {
    return { ok: false, error: "Student not found." };
  }

  const parsed = interventionPlanFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  try {
    await prisma.interventionPlan.create({
      data: {
        ...toPrismaData(parsed.data),
        studentId: ownedStudentId,
        createdById: teacherId,
      },
    });
  } catch (error) {
    console.error("createInterventionPlan failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}`);
}

export async function updateInterventionPlan(
  studentId: string,
  planId: string,
  values: InterventionPlanFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(
    `/dashboard/students/${studentId}/plans/${planId}/edit`
  );

  const ownedStudentId = await assertOwnsStudent(studentId, teacherId);
  if (!ownedStudentId) {
    return { ok: false, error: "Student not found." };
  }

  const parsed = interventionPlanFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  let updated: { count: number };
  try {
    // Composite ownership filter: plan must belong to the student we
    // already verified belongs to this teacher.
    updated = await prisma.interventionPlan.updateMany({
      where: { id: planId, studentId: ownedStudentId },
      data: toPrismaData(parsed.data),
    });
  } catch (error) {
    console.error("updateInterventionPlan failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (updated.count === 0) {
    return { ok: false, error: "Intervention plan not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}`);
}

export async function deleteInterventionPlan(
  studentId: string,
  planId: string
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
    deleted = await prisma.interventionPlan.deleteMany({
      where: { id: planId, studentId: ownedStudentId },
    });
  } catch (error) {
    console.error("deleteInterventionPlan failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (deleted.count === 0) {
    return { ok: false, error: "Intervention plan not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
  return { ok: true };
}
