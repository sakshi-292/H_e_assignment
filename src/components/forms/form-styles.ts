// Shared class strings for our form fields. The student, learning-gap,
// intervention-plan, and progress-note forms all use the same input and
// textarea look, so we keep the classes here. The `error` argument is
// RHF's field error object: pass `errors.<field>` from `formState`.
type FieldErrorLike = { message?: string } | undefined;

const INPUT_BASE =
  "block h-10 w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500";

const TEXTAREA_BASE =
  "block w-full rounded-lg border bg-white px-3 py-2 text-sm leading-6 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500";

const NEUTRAL_BORDER =
  "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-200 dark:focus:ring-zinc-200";

const ERROR_BORDER =
  "border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60 dark:focus:border-red-400 dark:focus:ring-red-400";

export function inputClass(error?: FieldErrorLike): string {
  return `${INPUT_BASE} ${error ? ERROR_BORDER : NEUTRAL_BORDER}`;
}

export function textareaClass(error?: FieldErrorLike): string {
  return `${TEXTAREA_BASE} ${error ? ERROR_BORDER : NEUTRAL_BORDER}`;
}
