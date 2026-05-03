import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTeacherId } from "@/lib/auth-helpers";
import { DeleteStudentButton } from "@/components/students/delete-student-button";
import {
  BADGE_BASE,
  STUDENT_STATUS_LABEL,
  STUDENT_STATUS_TONE,
} from "@/lib/display/badges";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const teacherId = await requireTeacherId("/dashboard/students");

  const students = await prisma.student.findMany({
    where: { teacherId },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      grade: true,
      status: true,
    },
  });

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-900/30">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              InterveneAI
            </Link>
            <span className="hidden text-sm text-zinc-400 sm:inline" aria-hidden>
              /
            </span>
            <span className="hidden text-sm font-medium text-zinc-700 sm:inline dark:text-zinc-300">
              Students
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Students
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage your roster, status, and contact details.
            </p>
          </div>
          <Link
            href="/dashboard/students/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-200"
          >
            Add student
          </Link>
        </div>

        <section className="mt-8">
          {students.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <table className="w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <caption className="sr-only">Your students</caption>
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Grade
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {students.map((student) => {
                    const fullName = `${student.firstName} ${student.lastName}`.trim();
                    return (
                      <tr key={student.id}>
                        <td className="px-4 py-3 font-medium">
                          <Link
                            href={`/dashboard/students/${student.id}`}
                            className="rounded text-zinc-900 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
                          >
                            {fullName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {student.grade}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`${BADGE_BASE} ${STUDENT_STATUS_TONE[student.status]}`}
                          >
                            {STUDENT_STATUS_LABEL[student.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/dashboard/students/${student.id}`}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
                            >
                              View
                            </Link>
                            <Link
                              href={`/dashboard/students/${student.id}/edit`}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-200"
                            >
                              Edit
                            </Link>
                            <DeleteStudentButton
                              id={student.id}
                              studentName={fullName}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-950">
      <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
        No students yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        Add your first student to start tracking learning gaps and building
        intervention plans.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/students/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-200"
        >
          Add your first student
        </Link>
      </div>
    </div>
  );
}
