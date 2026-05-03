"use server";

import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signUpSchema, type SignUpValues } from "@/lib/validators/auth";

type SignUpResult =
  | { ok: true }
  | { ok: false; error: string; field?: keyof SignUpValues };

/**
 * Create a new teacher account.
 *
 * - Hashes the password with bcrypt (cost 10).
 * - Defaults role to TEACHER.
 * - Returns a structured error on duplicate email so the form can surface it
 *   on the right field, instead of throwing.
 */
export async function signUp(values: SignUpValues): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Invalid sign-up details",
      field: first?.path[0] as keyof SignUpValues | undefined,
    };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: UserRole.TEACHER,
      },
    });
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        error: "An account with that email already exists.",
        field: "email",
      };
    }
    console.error("signUp failed", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
