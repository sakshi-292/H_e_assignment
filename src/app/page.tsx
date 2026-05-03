import { Hero } from "@/components/layout/hero";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Hero />
      </main>
    </div>
  );
}
