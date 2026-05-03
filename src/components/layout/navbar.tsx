import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <nav
        className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          InterveneAI
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
          <ButtonLink
            href="/auth/signup"
            className="h-9 px-4 text-xs sm:text-sm"
          >
            Get Started
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
