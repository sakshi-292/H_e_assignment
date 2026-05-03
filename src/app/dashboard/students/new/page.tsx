import Link from "next/link";
import { requireTeacherId } from "@/lib/auth-helpers";
import { StudentForm } from "@/components/forms/student-form";
import { createStudent } from "../actions";

export default async function NewStudentPage() {
  await requireTeacherId("/dashboard/students/new");

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
            href="/dashboard/students"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← All students
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Add a student
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            New students start in their initial status. You can update it
            anytime.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <StudentForm mode="create" onSubmit={createStudent} />
        </div>
      </main>
    </div>
  );
}
