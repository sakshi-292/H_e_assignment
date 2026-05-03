import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnedStudent } from "@/lib/auth-helpers";
import { ProgressNoteForm } from "@/components/forms/progress-note-form";
import { updateProgressNote } from "../../../notes/actions";

export const dynamic = "force-dynamic";

type EditProgressNotePageProps = {
  params: Promise<{ id: string; planId: string; noteId: string }>;
};

export default async function EditProgressNotePage({
  params,
}: EditProgressNotePageProps) {
  const { id, planId, noteId } = await params;

  const { student } = await requireOwnedStudent(
    id,
    `/dashboard/students/${id}/plans/${planId}/notes/${noteId}/edit`
  );

  // Composite WHERE encodes the full ownership chain (teacher → student → plan → note).
  const note = await prisma.progressNote.findFirst({
    where: {
      id: noteId,
      studentId: student.id,
      interventionPlanId: planId,
      interventionPlan: { studentId: student.id },
    },
    select: { id: true, note: true },
  });

  if (!note) {
    notFound();
  }

  const fullName = `${student.firstName} ${student.lastName}`.trim();
  const planHref = `/dashboard/students/${student.id}/plans/${planId}`;
  const update = updateProgressNote.bind(null, student.id, planId, note.id);

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-900/30">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/dashboard"
              className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              InterveneAI
            </Link>
            <span className="hidden text-sm text-zinc-400 sm:inline" aria-hidden>
              /
            </span>
            <Link
              href={`/dashboard/students/${student.id}`}
              className="hidden truncate text-sm text-zinc-600 transition-colors hover:text-zinc-900 sm:inline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {fullName}
            </Link>
            <span className="hidden text-sm text-zinc-400 sm:inline" aria-hidden>
              /
            </span>
            <Link
              href={planHref}
              className="hidden truncate text-sm text-zinc-600 transition-colors hover:text-zinc-900 sm:inline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Plan
            </Link>
            <span className="hidden text-sm text-zinc-400 sm:inline" aria-hidden>
              /
            </span>
            <span className="hidden truncate text-sm font-medium text-zinc-700 sm:inline dark:text-zinc-300">
              Edit note
            </span>
          </div>
          <Link
            href={planHref}
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to plan
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit progress note
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Update what you wrote about {student.firstName}&apos;s session.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
          <ProgressNoteForm
            mode="edit"
            defaultValue={note.note}
            cancelHref={planHref}
            onSubmit={update}
          />
        </div>
      </main>
    </div>
  );
}
