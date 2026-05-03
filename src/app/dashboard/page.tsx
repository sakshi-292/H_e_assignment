import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { GapStatus, PlanStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  const teacherId = session.user.id;

  // Run the three counts in parallel since they are independent.
  const [studentCount, openGapCount, activePlanCount] = await Promise.all([
    prisma.student.count({ where: { teacherId } }),
    prisma.learningGap.count({
      where: { status: GapStatus.OPEN, student: { teacherId } },
    }),
    prisma.interventionPlan.count({
      where: { status: PlanStatus.ACTIVE, createdById: teacherId },
    }),
  ]);

  const stats = [
    { label: "Students", value: studentCount },
    { label: "Open Learning Gaps", value: openGapCount },
    { label: "Active Plans", value: activePlanCount },
  ] as const;

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-900/30">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            InterveneAI
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/students"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Students
            </Link>
            <span className="hidden text-sm text-zinc-600 sm:inline dark:text-zinc-400">
              {session.user.name ?? session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Teacher"}.
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            A quick snapshot of your classroom. CRUD screens for students,
            learning gaps, and intervention plans are coming next.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
            </li>
          ))}
        </ul>

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              Manage your roster
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Add, edit, or remove students. Learning gaps and intervention
              plans will land next.
            </p>
          </div>
          <Link
            href="/dashboard/students"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-200"
          >
            View students
          </Link>
        </section>
      </main>
    </div>
  );
}
