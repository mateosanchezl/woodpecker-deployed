"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { StreakCard } from "@/components/dashboard/streak-card";
import { XpCard } from "@/components/dashboard/xp-card";
import { UpdateNotification } from "@/components/dashboard/update-notification";
import { DashboardFeedbackPrompt } from "@/components/dashboard/dashboard-feedback-prompt";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Plus,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { getTrainingThemeLabel } from "@/lib/chess/training-themes";

interface UserData {
  user: {
    id: string;
    email: string;
    name: string | null;
    estimatedRating: number;
    preferredSetSize: number;
    targetCycles: number;
    hasCompletedOnboarding: boolean;
    puzzleSetCount: number;
    createdAt: string;
  };
}

interface PuzzleSetsData {
  sets: Array<{
    id: string;
    name: string;
    size: number;
    focusTheme: string | null;
    targetCycles: number;
    targetRating: number;
    minRating: number;
    maxRating: number;
    isActive: boolean;
    createdAt: string;
    currentCycle: number | null;
    currentCycleId: string | null;
    completedCycles: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // Fetch puzzle sets
  const { data: puzzleSetsData, isLoading: setsLoading } =
    useQuery<PuzzleSetsData>({
      queryKey: ["puzzle-sets"],
      queryFn: async () => {
        const res = await fetch("/api/training/puzzle-sets");
        if (!res.ok) throw new Error("Failed to fetch puzzle sets");
        return res.json();
      },
      enabled: !!userData,
    });

  // Loading state
  if (userLoading || !userData) {
    return <DashboardSkeleton />;
  }

  const showQuickStart = userData.user.puzzleSetCount === 0;

  return (
    <>
      <DashboardFeedbackPrompt />
      {showQuickStart ? (
        <div className="max-w-2xl mx-auto py-12 w-full">
          <Card className="border-primary/20 shadow-lg shadow-primary/5 bg-linear-to-b from-card to-primary/5 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0 opacity-50" />
            <CardHeader className="text-center space-y-3 pb-6 pt-10">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2 animate-in fade-in zoom-in duration-500">
                <Play className="h-8 w-8 text-primary ml-1" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Start Your First Set</CardTitle>
              <CardDescription className="text-base text-muted-foreground max-w-md mx-auto">
                You repeat a fixed set of puzzles in cycles. Each cycle gets faster as patterns become automatic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="gap-2 w-full sm:w-auto rounded-xl text-base px-8 h-12 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/20">
                  <Link href="/training?quickstart=1">
                    <Play className="h-5 w-5 fill-current" />
                    Start Training Now
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto rounded-xl text-base px-8 h-12 hover:bg-primary/5">
                  <Link href="/training/new">Customize First Set</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-6">
                Want the full method?{" "}
                <Link
                  href="/woodpecker-method"
                  className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
                >
                  Learn the Woodpecker Method
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Update Notification */}
          <UpdateNotification />

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {userData.user.name
                  ? `Welcome back, ${userData.user.name.split(" ")[0]}`
                  : "Welcome back"} 👋
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Ready to crush some puzzles today?
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/changelog">Changelog</Link>
              </Button>
              <Button
                className="gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-none border-0"
                onClick={() => router.push("/training/new")}
              >
                <Plus className="h-4 w-4" />
                New Set
              </Button>
            </div>
          </div>

          {/* XP and Streak Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <XpCard />
            <StreakCard />
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="Total Sets"
              value={puzzleSetsData?.sets.length || 0}
              icon={Target}
              colorClass="text-blue-500"
              bgClass="bg-blue-500/10"
            />
            <StatsCard
              title="Active Training"
              value={puzzleSetsData?.sets.filter((s) => s.isActive).length || 0}
              icon={TrendingUp}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-500/10"
            />
            <StatsCard
              title="Your Rating"
              value={userData.user.estimatedRating}
              icon={CheckCircle2}
              colorClass="text-amber-500"
              bgClass="bg-amber-500/10"
            />
          </div>

          {/* Puzzle Sets */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Puzzle Sets</h2>
            {setsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48 mt-1" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {puzzleSetsData?.sets.map((set) => (
                  <PuzzleSetCard key={set.id} set={set} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  bgClass?: string;
}

function StatsCard({ title, value, icon: Icon, colorClass = "text-primary", bgClass = "bg-primary/10" }: StatsCardProps) {
  return (
    <Card className="transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
          </div>
          <div className={`p-3 rounded-2xl ${bgClass}`}>
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PuzzleSetCardProps {
  set: PuzzleSetsData["sets"][0];
}

function PuzzleSetCard({ set }: PuzzleSetCardProps) {
  const router = useRouter();
  const cycleProgress = (set.completedCycles / set.targetCycles) * 100;
  const hasActiveCycle = set.currentCycleId !== null;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/20 duration-300 group flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">{set.name}</CardTitle>
            <CardDescription className="flex flex-wrap gap-1.5 items-center mt-1">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {set.size} puzzles
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {set.minRating}-{set.maxRating}
              </span>
              {set.focusTheme && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {getTrainingThemeLabel(set.focusTheme)}
                </span>
              )}
            </CardDescription>
          </div>
          {set.completedCycles >= set.targetCycles && (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Complete
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 flex-1 flex flex-col justify-end">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Cycle progress</span>
            <span className="font-semibold tabular-nums">
              {set.completedCycles} / {set.targetCycles}
            </span>
          </div>
          <Progress value={cycleProgress} className="h-2.5 bg-muted/50" />
        </div>

        <div className="flex items-center gap-5 text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-amber-500" />
            <span>Target: {set.targetRating}</span>
          </div>
          {set.currentCycle && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Cycle {set.currentCycle}</span>
            </div>
          )}
        </div>

        <Button
          className="w-full gap-2 rounded-xl h-11 mt-2 transition-transform active:scale-[0.98]"
          onClick={() => router.push(`/training?setId=${set.id}`)}
          variant={hasActiveCycle ? "default" : "secondary"}
        >
          <Play className="h-4 w-4" />
          {hasActiveCycle ? "Continue Training" : "Start Next Cycle"}
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
