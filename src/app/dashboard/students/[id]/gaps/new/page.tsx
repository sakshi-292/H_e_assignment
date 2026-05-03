import Link from "next/link";
import { requireOwnedStudent } from "@/lib/auth-helpers";
import { LearningGapForm } from "@/components/forms/learning-gap-form";
import { createLearningGap } from "../actions";

type NewLearningGapPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewLearningGapPage({
  params,
}: NewLearningGapPageProps) {
  const { id } = await params;
  const { student } = await requireOwnedStudent(
    id,
    `/dashboard/students/${id}/gaps/new`
  );

  const create = createLearningGap.bind(null, student.id);
  const fullName = `${student.firstName} ${student.lastName}`.trim();

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-900/30">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            InterveneAI
          </Link>
          <Link
            href={`/dashboard/students/${student.id}`}
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to {student.firstName}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Add learning gap for {fullName}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Capture what you&apos;re seeing in class. Keep it concrete; you can
            edit it later.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <LearningGapForm
            mode="create"
            studentId={student.id}
            onSubmit={create}
          />
        </div>
      </main>
    </div>
  );
}
