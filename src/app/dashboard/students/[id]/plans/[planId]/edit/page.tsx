import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnedStudent } from "@/lib/auth-helpers";
import { InterventionPlanForm } from "@/components/forms/intervention-plan-form";
import type { InterventionPlanFormValues } from "@/lib/validators/intervention-plan";
import { updateInterventionPlan } from "../../actions";

type EditPlanPageProps = {
  params: Promise<{ id: string; planId: string }>;
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id, planId } = await params;
  const { student } = await requireOwnedStudent(
    id,
    `/dashboard/students/${id}/plans/${planId}/edit`
  );

  const plan = await prisma.interventionPlan.findFirst({
    where: { id: planId, studentId: student.id },
    select: {
      id: true,
      title: true,
      strategy: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });

  if (!plan) {
    notFound();
  }

  const defaultValues: InterventionPlanFormValues = {
    title: plan.title,
    strategy: plan.strategy,
    startDate: toIsoDate(plan.startDate),
    endDate: plan.endDate ? toIsoDate(plan.endDate) : "",
    status: plan.status,
  };

  const update = updateInterventionPlan.bind(null, student.id, plan.id);

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
            Edit intervention plan
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Update strategy, dates, or status as the plan evolves.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <InterventionPlanForm
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
