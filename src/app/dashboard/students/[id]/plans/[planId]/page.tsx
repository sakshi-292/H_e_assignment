import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnedStudent } from "@/lib/auth-helpers";
import { ProgressNoteForm } from "@/components/forms/progress-note-form";
import { DeleteProgressNoteButton } from "@/components/progress-notes/delete-progress-note-button";
import {
  BADGE_BASE,
  PLAN_STATUS_LABEL,
  PLAN_STATUS_TONE,
} from "@/lib/display/badges";
import { createProgressNote } from "./notes/actions";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

type PlanDetailPageProps = {
  params: Promise<{ id: string; planId: string }>;
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id, planId } = await params;
  const { student } = await requireOwnedStudent(
    id,
    `/dashboard/students/${id}/plans/${planId}`
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
      progressNotes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, note: true, createdAt: true },
      },
    },
  });

  if (!plan) {
    notFound();
  }

  const fullName = `${student.firstName} ${student.lastName}`.trim();
  const create = createProgressNote.bind(null, student.id, plan.id);

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
            <span className="hidden truncate text-sm font-medium text-zinc-700 sm:inline dark:text-zinc-300">
              Plan
            </span>
          </div>
          <Link
            href={`/dashboard/students/${student.id}`}
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to {student.firstName}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <section
          aria-labelledby="plan-summary"
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Intervention plan for {fullName}
              </p>
              <h1
                id="plan-summary"
                className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                {plan.title}
              </h1>
            </div>
            <Link
              href={`/dashboard/students/${student.id}/plans/${plan.id}/edit`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
            >
              Edit plan
            </Link>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <SummaryItem
              label="Status"
              value={
                <span
                  className={`${BADGE_BASE} ${PLAN_STATUS_TONE[plan.status]}`}
                >
                  {PLAN_STATUS_LABEL[plan.status]}
                </span>
              }
            />
            <SummaryItem
              label="Start date"
              value={dateFormatter.format(plan.startDate)}
            />
            <SummaryItem
              label="End date"
              value={
                plan.endDate ? dateFormatter.format(plan.endDate) : "Ongoing"
              }
            />
          </dl>

          <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Strategy
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {plan.strategy}
            </p>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="notes-heading">
          <h2
            id="notes-heading"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Progress notes
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Short updates after each session keep the plan honest.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <ProgressNoteForm onSubmit={create} />
          </div>

          {plan.progressNotes.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-950">
              <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                No progress notes yet.
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                Once you run a session, log a quick note above so future-you
                can see what worked.
              </p>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {plan.progressNotes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {note.note}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/dashboard/students/${student.id}/plans/${plan.id}/notes/${note.id}/edit`}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
                      >
                        Edit
                      </Link>
                      <DeleteProgressNoteButton
                        studentId={student.id}
                        planId={plan.id}
                        noteId={note.id}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {dateTimeFormatter.format(note.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}
