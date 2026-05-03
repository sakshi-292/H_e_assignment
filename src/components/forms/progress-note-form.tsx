"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  progressNoteFormSchema,
  type ProgressNoteFormValues,
} from "@/lib/validators/progress-note";
import type { ActionResult } from "@/app/dashboard/students/[id]/plans/[planId]/notes/actions";
import { textareaClass } from "@/components/forms/form-styles";

type ProgressNoteFormProps = {
  onSubmit: (values: ProgressNoteFormValues) => Promise<ActionResult>;
  /** Pre-fill when editing an existing note. */
  defaultValue?: string;
  /** Defaults to "create". When "edit", labels shift and the form does not reset on success. */
  mode?: "create" | "edit";
  /** Optional cancel target shown in edit mode. */
  cancelHref?: string;
};

export function ProgressNoteForm({
  onSubmit,
  defaultValue = "",
  mode = "create",
  cancelHref,
}: ProgressNoteFormProps) {
  const isEdit = mode === "edit";
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProgressNoteFormValues>({
    resolver: zodResolver(progressNoteFormSchema),
    defaultValues: { note: defaultValue },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = form;

  const submit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await onSubmit(values);
      // In edit mode the server action redirects on success, so we only reach
      // here on failure. In create mode we clear the textarea so the teacher
      // can keep logging.
      if (!result.ok) {
        if (result.fieldErrors?.note) {
          setError("note", { type: "server", message: result.fieldErrors.note });
        } else {
          setError("root", { type: "server", message: result.error });
        }
        return;
      }
      if (!isEdit) {
        reset({ note: "" });
      }
    });
  });

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {isEdit ? "Edit progress note" : "Add a progress note"}
        </label>
        <textarea
          id="note"
          rows={isEdit ? 5 : 3}
          disabled={isPending}
          placeholder="Session 3: Aanya solved 4/5 problems independently…"
          {...register("note")}
          className={`mt-1 ${textareaClass(errors.note)}`}
        />
        {errors.note?.message ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.note.message}
          </p>
        ) : (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            Short, factual updates work best. Min 5 characters.
          </p>
        )}
      </div>

      {errors.root?.message ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {isEdit && cancelHref ? (
          <Link
            href={cancelHref}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
          >
            Cancel
          </Link>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-200"
        >
          {isPending
            ? isEdit
              ? "Saving…"
              : "Adding…"
            : isEdit
              ? "Save changes"
              : "Add note"}
        </button>
      </div>
    </form>
  );
}
