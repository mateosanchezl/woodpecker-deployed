"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { StreakCard } from "@/components/dashboard/streak-card";
import { XpCard } from "@/components/dashboard/xp-card";
import { UpdateNotification } from "@/components/dashboard/update-notification";
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
      {showQuickStart ? (
        <div className="max-w-2xl mx-auto py-8 w-full">
          <Card>
            <CardHeader className="text-center space-y-2">
              <CardTitle>Start Training Now</CardTitle>
              <CardDescription>
                You repeat a fixed set in cycles. Each cycle gets faster as patterns become automatic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gap-2">
                  <Link href="/training?quickstart=1">
                    <Play className="h-4 w-4" />
                    Start Training Now
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/training/new">Customize First Set</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Want the full method?{' '}
                <Link href="/woodpecker-method" className="underline underline-offset-2">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                {userData.user.name
                  ? `Welcome back, ${userData.user.name.split(" ")[0]}`
                  : "Welcome back"}
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/training/new")}
            >
              <Plus className="h-4 w-4" />
              New Set
            </Button>
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
            />
            <StatsCard
              title="Active Training"
              value={puzzleSetsData?.sets.filter((s) => s.isActive).length || 0}
              icon={TrendingUp}
            />
            <StatsCard
              title="Your Rating"
              value={userData.user.estimatedRating}
              icon={CheckCircle2}
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
}

function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground/50" />
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{set.name}</CardTitle>
            <CardDescription>
              {set.size} puzzles · {set.minRating}-{set.maxRating} rating
            </CardDescription>
          </div>
          {set.completedCycles >= set.targetCycles && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              Complete
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cycle progress</span>
            <span className="font-medium">
              {set.completedCycles} / {set.targetCycles}
            </span>
          </div>
          <Progress value={cycleProgress} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>~{set.targetRating}</span>
          </div>
          {set.currentCycle && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Cycle {set.currentCycle}</span>
            </div>
          )}
        </div>

        <Button
          className="w-full gap-2"
          onClick={() => router.push(`/training?setId=${set.id}`)}
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
