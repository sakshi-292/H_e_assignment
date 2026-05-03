"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PLAN_STATUS_OPTIONS,
  interventionPlanFormSchema,
  type InterventionPlanFormValues,
} from "@/lib/validators/intervention-plan";
import type { ActionResult } from "@/app/dashboard/students/[id]/plans/actions";
import { inputClass, textareaClass } from "@/components/forms/form-styles";

const STATUS_LABELS: Record<(typeof PLAN_STATUS_OPTIONS)[number], string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

type InterventionPlanFormProps = {
  mode: "create" | "edit";
  studentId: string;
  defaultValues?: Partial<InterventionPlanFormValues>;
  onSubmit: (values: InterventionPlanFormValues) => Promise<ActionResult>;
};

export function InterventionPlanForm({
  mode,
  studentId,
  defaultValues,
  onSubmit,
}: InterventionPlanFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<InterventionPlanFormValues>({
    resolver: zodResolver(interventionPlanFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      strategy: defaultValues?.strategy ?? "",
      startDate: defaultValues?.startDate ?? "",
      endDate: defaultValues?.endDate ?? "",
      status: defaultValues?.status ?? "DRAFT",
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
              setError(field as keyof InterventionPlanFormValues, {
                type: "server",
                message,
              });
            }
          }
        } else {
          setError("root", { type: "server", message: result.error });
        }
      }
    });
  });

  const submitLabel =
    mode === "create"
      ? isPending
        ? "Creating plan…"
        : "Create plan"
      : isPending
        ? "Saving…"
        : "Update plan";

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field
        id="title"
        label="Title"
        error={errors.title?.message}
        hint="Short label, e.g. “Word-problem decoding bootcamp”"
      >
        <input
          id="title"
          type="text"
          disabled={isPending}
          {...register("title")}
          className={inputClass(errors.title)}
        />
      </Field>

      <Field
        id="strategy"
        label="Strategy"
        error={errors.strategy?.message}
        hint="What you'll try, how often, and how you'll measure progress."
      >
        <textarea
          id="strategy"
          rows={5}
          disabled={isPending}
          {...register("strategy")}
          className={textareaClass(errors.strategy)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="startDate"
          label="Start date"
          error={errors.startDate?.message}
        >
          <input
            id="startDate"
            type="date"
            disabled={isPending}
            {...register("startDate")}
            className={inputClass(errors.startDate)}
          />
        </Field>

        <Field
          id="endDate"
          label="End date"
          error={errors.endDate?.message}
          hint="Leave blank if the plan is ongoing."
        >
          <input
            id="endDate"
            type="date"
            disabled={isPending}
            {...register("endDate")}
            className={inputClass(errors.endDate)}
          />
        </Field>
      </div>

      <Field id="status" label="Status" error={errors.status?.message}>
        <select
          id="status"
          disabled={isPending}
          {...register("status")}
          className={inputClass(errors.status)}
        >
          {PLAN_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

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
          href={`/dashboard/students/${studentId}`}
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
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

