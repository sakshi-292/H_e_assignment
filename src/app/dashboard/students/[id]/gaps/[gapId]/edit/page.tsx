import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnedStudent } from "@/lib/auth-helpers";
import { LearningGapForm } from "@/components/forms/learning-gap-form";
import type { LearningGapFormValues } from "@/lib/validators/learning-gap";
import { updateLearningGap } from "../../../gaps/actions";

type EditLearningGapPageProps = {
  params: Promise<{ id: string; gapId: string }>;
};

export default async function EditLearningGapPage({
  params,
}: EditLearningGapPageProps) {
  const { id, gapId } = await params;
  const { student } = await requireOwnedStudent(
    id,
    `/dashboard/students/${id}/gaps/${gapId}/edit`
  );

  const gap = await prisma.learningGap.findFirst({
    where: { id: gapId, studentId: student.id },
    select: {
      id: true,
      title: true,
      subject: true,
      severity: true,
      status: true,
      description: true,
    },
  });

  if (!gap) {
    notFound();
  }

  const defaultValues: LearningGapFormValues = {
    title: gap.title,
    subject: gap.subject,
    severity: gap.severity,
    status: gap.status,
    description: gap.description,
  };

  const update = updateLearningGap.bind(null, student.id, gap.id);

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
            Edit learning gap
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Update the title, severity, status, or description as things change.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <LearningGapForm
            mode="edit"
            studentId={student.id}
            defaultValues={defaultValues}
            onSubmit={update}
          />
        </div>
      </main>
    </div>
  );
}
