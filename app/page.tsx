import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Brain, Zap, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center text-white dark:text-zinc-900">
              P
            </div>
            <span>Peck</span>
          </div>
          <nav className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Start Training</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 sm:py-32 lg:pb-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
              Master Chess Tactics with the <span className="text-zinc-500">Woodpecker Method</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Repetition is the mother of skill. Build rock-solid pattern recognition and calculation speed by solving the same set of puzzles repeatedly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start Training Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  How it works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="how-it-works" className="py-24 bg-white dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Target className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="text-xl font-semibold">Select Your Set</h3>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  Choose a set of high-quality tactical puzzles appropriate for your level.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Brain className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="text-xl font-semibold">Train Cycles</h3>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  Solve the same puzzles repeatedly. Your goal is to get faster and more accurate each time.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Zap className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
                </div>
                <h3 className="text-xl font-semibold">Build Intuition</h3>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                  Transform calculation into intuition. Recognize patterns instantly in your games.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Peck. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
