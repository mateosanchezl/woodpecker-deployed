export type ChangelogEntry = {
  version: string;
  title: string;
  description: string;
  features: string[];
  date: string;
  learnMoreUrl?: string;
  actionLabel?: string;
};

const CHANGELOG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

export function formatChangelogDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    CHANGELOG_DATE_FORMAT,
  );
}

// Add new releases to the top of this list so index 0 stays the latest.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "2.3.0",
    title: "Faster Training Flow, New Changelog, and Bug Reports",
    description:
      "Updates now live in a real changelog, training moves faster thanks to hot-path optimizations, and active sessions now include a lightweight issue reporter for faster bug fixes.",
    features: [
      "A new /changelog page shows the latest release plus a running history of past updates",
      "The dashboard notification now links directly to the full update history",
      "A persistent Changelog action in the dashboard header keeps release notes easy to reach",
      "The app sidebar now includes a Changelog link for fast access from anywhere in the product",
      "Training now uses a canonical session endpoint with prefetched next puzzles, reducing extra round-trips while you work through a cycle",
      "A subtle Report an issue action now appears in the training sidebar and error state so bugs can be reported without leaving the session",
      "Bug reports automatically include current session context and are sent straight to the admin inbox for faster triage",
    ],
    date: "2026-02-28",
    learnMoreUrl: "/changelog",
    actionLabel: "Open changelog",
  },
  {
    version: "2.2.0",
    title: "Flexible Puzzle Set Sizes",
    description:
      "You can now choose a flexible puzzle count when creating a set, starting at 50 puzzles. Build smaller speed sets or larger grind sets based on your training goals.",
    features: [
      "Set size now supports a flexible range from 50 to 500 puzzles",
      "Use the slider to dial in the exact size you want",
      "Great for quick 50-puzzle reps, standard sessions, or larger long-cycle sets",
      "Works with themed and non-themed sets when creating new training sets",
    ],
    date: "2026-02-27",
    learnMoreUrl: "/training/new",
    actionLabel: "Create a custom-size set",
  },
  {
    version: "2.1.0",
    title: "Create Puzzle Sets by Theme",
    description:
      "Build training sets around a single tactical theme: pins, forks, mates, sacrifices, and more. Drill one motif at a time for faster pattern recognition and sharper tactics.",
    features: [
      "Choose a focus theme when creating a set (e.g. Pins, Forks, Mates, Sacrifices)",
      "Puzzles are filtered to match your theme so every rep reinforces the same motif",
      "Ideal for targeting weak spots or deepening a specific tactical skill",
      "Available when creating a new set; pick \"Any theme\" or any of 15+ tactical themes",
      "Reminder: the Improvement Area (Review in the sidebar) lets you revisit your toughest puzzles and strengthen weak themes with walkthroughs and spaced repetition.",
    ],
    date: "2026-02-13",
    learnMoreUrl: "/training/new",
    actionLabel: "Create a themed set",
  },
  {
    version: "2.0.0",
    title: "The Improvement Area - Level Up Your Weaknesses",
    description:
      "A breakthrough feature that transforms how you train. Focus intensely on your toughest puzzles with guided walkthroughs and spaced repetition, the secret to dramatic rating gains.",
    features: [
      "Improvement Area: Review your most-struggled puzzles in one focused zone",
      "Discover your weakest themes and drill them with targeted practice",
      "Step through solutions interactively or watch auto-play demonstrations",
      "Spaced repetition ordering ensures optimal learning and retention",
    ],
    date: "2026-02-11",
    learnMoreUrl: "/training/review",
    actionLabel: "Learn more",
  },
  {
    version: "1.2.0",
    title: "Faster Start, First Puzzle in Seconds",
    description:
      "We streamlined onboarding so you can jump straight into training without the long setup.",
    features: [
      "Quick Start builds a starter puzzle set automatically",
      "Your first cycle starts immediately with no extra clicks",
      "Customize your set size, rating, and cycles anytime",
    ],
    date: "2026-02-03",
    learnMoreUrl: "/training",
    actionLabel: "Learn more",
  },
  {
    version: "1.1.0",
    title: "New Achievements System!",
    description:
      "Unlock achievements as you progress through your chess training journey.",
    features: [
      "Earn badges for completing puzzle sets and cycles",
      "Track your streak milestones and XP gains",
      "View all your achievements in the new Achievements page",
    ],
    date: "2026-01-29",
    learnMoreUrl: "/achievements",
    actionLabel: "Learn more",
  },
];

export const LATEST_CHANGELOG_ENTRY = CHANGELOG_ENTRIES[0]!;
