import { ButtonLink } from "@/components/ui/button-link";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="w-full max-w-3xl text-center"
    >
      <h1
        id="hero-heading"
        className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-zinc-50"
      >
        Identify Learning Gaps. Act Early.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
        A simple workspace for teachers to track students, log learning gaps,
        and plan targeted interventions in one place.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <ButtonLink href="/auth/signup">Get Started</ButtonLink>
        <ButtonLink href="/auth/login" variant="secondary">
          Sign in
        </ButtonLink>
      </div>
    </section>
  );
}
