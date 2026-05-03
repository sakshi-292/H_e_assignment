import Link from "next/link";

// Root 404 for any unmatched public route. The dashboard has its own
// themed 404 at src/app/dashboard/not-found.tsx.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            404
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:outline-zinc-200"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
