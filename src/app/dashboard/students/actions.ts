"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireTeacherId } from "@/lib/auth-helpers";
import {
  studentFormSchema,
  type StudentFormValues,
} from "@/lib/validators/student";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof StudentFormValues, string>> };

function flattenFieldErrors(
  parsed: ReturnType<typeof studentFormSchema.safeParse>
): Partial<Record<keyof StudentFormValues, string>> | undefined {
  if (parsed.success) return undefined;
  const flattened = parsed.error.flatten().fieldErrors;
  const result: Partial<Record<keyof StudentFormValues, string>> = {};
  for (const [key, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      result[key as keyof StudentFormValues] = messages[0];
    }
  }
  return result;
}

export async function createStudent(
  values: StudentFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId("/dashboard/students/new");

  const parsed = studentFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  try {
    await prisma.student.create({
      data: { ...parsed.data, teacherId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        error: "A student with this email already exists.",
        fieldErrors: { email: "A student with this email already exists." },
      };
    }
    console.error("createStudent failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}

export async function updateStudent(
  id: string,
  values: StudentFormValues
): Promise<ActionResult> {
  const teacherId = await requireTeacherId(`/dashboard/students/${id}/edit`);

  const parsed = studentFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed),
    };
  }

  let updated: { count: number };
  try {
    // updateMany with the teacherId filter ensures only the owner can update.
    updated = await prisma.student.updateMany({
      where: { id, teacherId },
      data: parsed.data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        error: "A student with this email already exists.",
        fieldErrors: { email: "A student with this email already exists." },
      };
    }
    console.error("updateStudent failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (updated.count === 0) {
    return { ok: false, error: "Student not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}

export async function deleteStudent(id: string): Promise<ActionResult> {
  const teacherId = await requireTeacherId("/dashboard/students");

  let result: { count: number };
  try {
    result = await prisma.student.deleteMany({
      where: { id, teacherId },
    });
  } catch (error) {
    console.error("deleteStudent failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }

  if (result.count === 0) {
    return { ok: false, error: "Student not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  return { ok: true };
}
