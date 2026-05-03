import Link from "next/link";
import { GapSeverity, GapStatus, PlanStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwnedStudent } from "@/lib/auth-helpers";
import { DeleteLearningGapButton } from "@/components/learning-gaps/delete-learning-gap-button";
import { DeleteInterventionPlanButton } from "@/components/intervention-plans/delete-intervention-plan-button";
import {
  BADGE_BASE,
  GAP_SEVERITY_LABEL,
  GAP_SEVERITY_TONE,
  GAP_STATUS_LABEL,
  GAP_STATUS_TONE,
  PLAN_STATUS_LABEL,
  PLAN_STATUS_TONE,
  STUDENT_STATUS_LABEL,
  STUDENT_STATUS_TONE,
} from "@/lib/display/badges";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

type StudentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { id } = await params;
  const { student } = await requireOwnedStudent(id, `/dashboard/students/${id}`);

  const fullName = `${student.firstName} ${student.lastName}`.trim();

  const [gaps, plans] = await Promise.all([
    prisma.learningGap.findMany({
      where: { studentId: student.id },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        subject: true,
        severity: true,
        status: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.interventionPlan.findMany({
      where: { studentId: student.id },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true,
        title: true,
        strategy: true,
        startDate: true,
        endDate: true,
        status: true,
        progressNotes: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { note: true, createdAt: true },
        },
      },
    }),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-900/30">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
              href="/dashboard/students"
              className="hidden truncate text-sm text-zinc-600 transition-colors hover:text-zinc-900 sm:inline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Students
            </Link>
            <span className="hidden text-sm text-zinc-400 sm:inline" aria-hidden>
              /
            </span>
            <span className="hidden truncate text-sm font-medium text-zinc-700 sm:inline dark:text-zinc-300">
              {fullName}
            </span>
          </div>
          <Link
            href="/dashboard/students"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to students
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <section
          aria-labelledby="student-summary"
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                id="student-summary"
                className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                {fullName}
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {student.email}
              </p>
            </div>
            <Link
              href={`/dashboard/students/${student.id}/edit`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
            >
              Edit student
            </Link>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <SummaryItem label="Grade" value={student.grade} />
            <SummaryItem
              label="Status"
              value={
                <span
                  className={`${BADGE_BASE} ${STUDENT_STATUS_TONE[student.status]}`}
                >
                  {STUDENT_STATUS_LABEL[student.status]}
                </span>
              }
            />
            <SummaryItem label="Email" value={student.email} />
          </dl>

          {student.notes ? (
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">
                {student.notes}
              </p>
            </div>
          ) : null}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <GapsSection studentId={student.id} firstName={student.firstName} gaps={gaps} />
          <PlansSection
            studentId={student.id}
            firstName={student.firstName}
            plans={plans}
          />
        </div>
      </main>
    </div>
  );
}

type GapRow = {
  id: string;
  title: string;
  subject: string;
  severity: GapSeverity;
  status: GapStatus;
  description: string;
  createdAt: Date;
};

function GapsSection({
  studentId,
  firstName,
  gaps,
}: {
  studentId: string;
  firstName: string;
  gaps: GapRow[];
}) {
  return (
    <section aria-labelledby="gaps-heading">
      <SectionHeader
        id="gaps-heading"
        title="Learning gaps"
        subtitle={
          gaps.length === 0
            ? "Capture your first observation to start tracking progress."
            : `${gaps.length} ${gaps.length === 1 ? "gap" : "gaps"} recorded.`
        }
        action={
          <Link
            href={`/dashboard/students/${studentId}/gaps/new`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
          >
            Add gap
          </Link>
        }
      />

      {gaps.length === 0 ? (
        <EmptyCard
          heading="No learning gaps recorded yet."
          description={`Log what ${firstName} is finding hard. You can plan interventions from there.`}
          ctaLabel="Log first gap"
          ctaHref={`/dashboard/students/${studentId}/gaps/new`}
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {gaps.map((gap) => (
            <li
              key={gap.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-medium text-zinc-900 dark:text-zinc-50">
                    {gap.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {gap.subject} · Created {dateFormatter.format(gap.createdAt)}
                  </p>
                </div>
                <RowActions>
                  <Link
                    href={`/dashboard/students/${studentId}/gaps/${gap.id}/edit`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
                  >
                    Edit
                  </Link>
                  <DeleteLearningGapButton
                    studentId={studentId}
                    gapId={gap.id}
                    gapTitle={gap.title}
                  />
                </RowActions>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`${BADGE_BASE} ${GAP_SEVERITY_TONE[gap.severity]}`}
                >
                  {GAP_SEVERITY_LABEL[gap.severity]} severity
                </span>
                <span
                  className={`${BADGE_BASE} ${GAP_STATUS_TONE[gap.status]}`}
                >
                  {GAP_STATUS_LABEL[gap.status]}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {gap.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type PlanRow = {
  id: string;
  title: string;
  strategy: string;
  startDate: Date;
  endDate: Date | null;
  status: PlanStatus;
  progressNotes: { note: string; createdAt: Date }[];
};

function PlansSection({
  studentId,
  firstName,
  plans,
}: {
  studentId: string;
  firstName: string;
  plans: PlanRow[];
}) {
  return (
    <section aria-labelledby="plans-heading">
      <SectionHeader
        id="plans-heading"
        title="Intervention plans"
        subtitle={
          plans.length === 0
            ? "Decide what you'll try next, when, and how long."
            : `${plans.length} ${plans.length === 1 ? "plan" : "plans"} on file.`
        }
        action={
          <Link
            href={`/dashboard/students/${studentId}/plans/new`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
          >
            Add plan
          </Link>
        }
      />

      {plans.length === 0 ? (
        <EmptyCard
          heading="No intervention plans yet."
          description={`Once you've logged a gap, draft a plan for how ${firstName} will close it.`}
          ctaLabel="Draft first plan"
          ctaHref={`/dashboard/students/${studentId}/plans/new`}
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {plans.map((plan) => {
            const latestNote = plan.progressNotes[0];
            return (
              <li
                key={plan.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-medium">
                      <Link
                        href={`/dashboard/students/${studentId}/plans/${plan.id}`}
                        className="rounded text-zinc-900 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
                      >
                        {plan.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {dateFormatter.format(plan.startDate)} to{" "}
                      {plan.endDate
                        ? dateFormatter.format(plan.endDate)
                        : "ongoing"}
                    </p>
                  </div>
                  <RowActions>
                    <Link
                      href={`/dashboard/students/${studentId}/plans/${plan.id}/edit`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
                    >
                      Edit
                    </Link>
                    <DeleteInterventionPlanButton
                      studentId={studentId}
                      planId={plan.id}
                      planTitle={plan.title}
                    />
                  </RowActions>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`${BADGE_BASE} ${PLAN_STATUS_TONE[plan.status]}`}
                  >
                    {PLAN_STATUS_LABEL[plan.status]}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {plan.strategy}
                </p>

                {latestNote ? (
                  <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">
                        Latest update:
                      </span>{" "}
                      <span className="line-clamp-1 align-middle text-zinc-700 dark:text-zinc-300">
                        {latestNote.note}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {dateFormatter.format(latestNote.createdAt)}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
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

function SectionHeader({
  id,
  title,
  subtitle,
  action,
}: {
  id: string;
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2
          id={id}
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
}

function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function EmptyCard({
  heading,
  description,
  ctaLabel,
  ctaHref,
}: {
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-950">
      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
        {heading}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <div className="mt-6">
        <Link
          href={ctaHref}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-200"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
