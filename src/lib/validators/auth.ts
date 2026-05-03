import { z } from "zod";

/**
 * Schema for the sign-up form.
 *
 * - `password` is capped at 72 chars because that's bcrypt's input limit.
 * - `confirmPassword` is validated via `.refine` so the error attaches to the
 *   confirm field, not the password field.
 */
export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.infer<typeof signUpSchema>;
