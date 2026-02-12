import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const PUBLIC_STATS_REVALIDATE_SECONDS = 12 * 60 * 60;

export const getPublicCompletedPuzzlesCount = unstable_cache(
  async () => {
    try {
      const aggregate = await prisma.user.aggregate({
        _sum: {
          totalCorrectAttempts: true,
        },
      });

      return aggregate._sum.totalCorrectAttempts ?? 4200;
    } catch (error) {
      console.error("Failed to fetch public completed puzzles count", error);
      return 4200;
    }
  },
  ["public-completed-puzzles-count"],
  {
    revalidate: PUBLIC_STATS_REVALIDATE_SECONDS,
  },
);
