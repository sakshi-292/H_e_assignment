"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  STUDENT_FORM_STATUSES,
  studentFormSchema,
  type StudentFormValues,
} from "@/lib/validators/student";
import type { ActionResult } from "@/app/dashboard/students/actions";
import { inputClass } from "@/components/forms/form-styles";

const STATUS_LABELS: Record<(typeof STUDENT_FORM_STATUSES)[number], string> = {
  ACTIVE: "Active",
  NEEDS_SUPPORT: "Needs support",
  IMPROVING: "Improving",
};

type StudentFormProps = {
  mode: "create" | "edit";
  defaultValues?: Partial<StudentFormValues>;
  onSubmit: (values: StudentFormValues) => Promise<ActionResult>;
};

export function StudentForm({ mode, defaultValues, onSubmit }: StudentFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      grade: defaultValues?.grade ?? "",
      status: defaultValues?.status ?? "ACTIVE",
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const submit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await onSubmit(values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            if (message) {
              setError(field as keyof StudentFormValues, {
                type: "server",
                message,
              });
            }
          }
        } else {
          setError("root", { type: "server", message: result.error });
        }
      }
      // On success the server action redirects; the component unmounts.
    });
  });

  const submitLabel =
    mode === "create"
      ? isPending
        ? "Creating…"
        : "Create student"
      : isPending
        ? "Saving…"
        : "Save changes";

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          error={errors.firstName?.message}
        >
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            disabled={isPending}
            {...register("firstName")}
            className={inputClass(errors.firstName)}
          />
        </Field>

        <Field
          id="lastName"
          label="Last name"
          error={errors.lastName?.message}
        >
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            disabled={isPending}
            {...register("lastName")}
            className={inputClass(errors.lastName)}
          />
        </Field>
      </div>

      <Field id="email" label="Email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isPending}
          {...register("email")}
          className={inputClass(errors.email)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="grade"
          label="Grade"
          error={errors.grade?.message}
          hint="e.g. Grade 5"
        >
          <input
            id="grade"
            type="text"
            disabled={isPending}
            {...register("grade")}
            className={inputClass(errors.grade)}
          />
        </Field>

        <Field id="status" label="Status" error={errors.status?.message}>
          <select
            id="status"
            disabled={isPending}
            {...register("status")}
            className={inputClass(errors.status)}
          >
            {STUDENT_FORM_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {errors.root?.message ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <Link
          href="/dashboard/students"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-200"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

