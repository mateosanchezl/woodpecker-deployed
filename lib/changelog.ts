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

export function getUnreadChangelogEntries(
  dismissedVersion: string | null | undefined,
): ChangelogEntry[] {
  const latestEntry = CHANGELOG_ENTRIES[0];

  if (!latestEntry) {
    return [];
  }

  if (!dismissedVersion) {
    return [latestEntry];
  }

  const dismissedIndex = CHANGELOG_ENTRIES.findIndex(
    (entry) => entry.version === dismissedVersion,
  );

  if (dismissedIndex === 0) {
    return [];
  }

  if (dismissedIndex === -1) {
    return [latestEntry];
  }

  return CHANGELOG_ENTRIES.slice(0, dismissedIndex);
}

// Add new releases to the top of this list so index 0 stays the latest.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "2.9.4",
    title: "Training Shortcuts and Quick Resume",
    description:
      "Training now has keyboard-first controls, and the app header can take you straight back to an unfinished cycle from anywhere in the app.",
    features: [
      "Use S to skip, T to show or hide the timer, Enter to advance, and Space to continue through the current training context",
      "Missed-line review keeps ArrowLeft and ArrowRight stepping, with visible key hints on the review and next-puzzle controls",
      "The app header now shows the current page context and a compact Continue action when an unfinished training cycle exists",
      "The Continue action reuses the existing app bootstrap data, so it does not add another database or API request",
      "Nested training pages now keep the correct sidebar item active while you move between training, new set creation, and review",
    ],
    date: "2026-04-27",
    learnMoreUrl: "/training",
    actionLabel: "Continue training",
  },
  {
    version: "2.9.3",
    title: "Flexible Rating Range",
    description:
      "Puzzle set creation now gives you a recommended rating range by default, with the option to unlock the full 800-2600 target rating range when you want more control.",
    features: [
      "A new Recommended range toggle keeps setup guided for most players",
      "Turn the toggle off to choose any target puzzle rating from 800 to 2600",
      "The rating controls now include clearer guidance without shifting the setup card while you adjust them",
    ],
    date: "2026-04-27",
    learnMoreUrl: "/training/new",
    actionLabel: "Create a puzzle set",
  },
  {
    version: "2.9.2",
    title: "Mate-in-1 Validation Fix",
    description:
      "Mate-in-1 puzzles now accept alternate legal checkmates instead of forcing only the single canonical Lichess line.",
    features: [
      "Alternate mating moves now count as correct on mate-in-1 puzzles, even when Peck's stored line uses a different final move",
      "Training and review both use the same relaxed mate-in-1 validation, so retries behave consistently",
      "If a mate puzzle still rejects a valid winning line, please report it so we can inspect that specific puzzle and tighten the validator further",
    ],
    date: "2026-04-20",
    learnMoreUrl: "/training",
    actionLabel: "Open training",
  },
  {
    version: "2.9.1",
    title: "Mate Puzzle Solution Notice",
    description:
      "Some Lichess mate puzzles allow multiple winning continuations, but Peck still validates the single canonical line bundled with the puzzle. A new in-session heads-up now explains that behavior when it appears.",
    features: [
      "Mate puzzles now show a known-issue notice explaining why an alternative mating line can still be marked incorrect here",
      "The existing View in Lichess action remains the fastest way to confirm alternate mate continuations on the original puzzle page",
      "This is a current puzzle-validation limitation, not a problem with your account, rating, or saved training set",
    ],
    date: "2026-04-20",
    learnMoreUrl: "/training",
    actionLabel: "Open training",
  },
  {
    version: "2.9.0",
    title: "Supporter Badges",
    description:
      "Buy Me a Coffee supporters now get a supporter badge on their Peck account as a small thank-you for helping keep the app running and improving.",
    features: [
      "Supporters can now be marked directly on their Peck account",
      "A new supporter badge appears in the app shell, dashboard, and leaderboard",
      "The Support page now shows a dedicated thank-you state for supporters",
    ],
    date: "2026-04-06",
    learnMoreUrl: "/support",
    actionLabel: "Open support",
  },
  {
    version: "2.8.0",
    title: "Support Peck!",
    description:
      "A new Support page is now available if you'd like to help keep Peck running and improving.",
    features: [
      "You can now optionally support the development of Peck with a coffee",
    ],
    date: "2026-03-25",
    learnMoreUrl: "/support",
    actionLabel: "Open support",
  },
  {
    version: "2.7.2",
    title: "UI Improvements",
    description:
      "A small UI polish pass across navigation, training, and setup.",
    features: [
      "Cleaner navigation and sidebar grouping",
      "Refreshed training and dashboard cards",
      "Polished setup and progress UI",
    ],
    date: "2026-03-12",
    learnMoreUrl: "/training",
    actionLabel: "Open training",
  },
  {
    version: "2.7.1",
    title: "Improved Missed-Puzzle Review",
    description:
      "Review now makes it easier to find missed puzzles and try them again.",
    features: [
      "Missed puzzles are easier to scan in one simple queue",
      "Open any missed puzzle and retry it right away",
      "Review controls now stay focused on retrying the puzzle or seeing the line",
      "Your saved board theme still carries into review",
    ],
    date: "2026-03-10",
    learnMoreUrl: "/training/review",
    actionLabel: "Retry missed puzzles",
  },
  {
    version: "2.7.0",
    title: "Training Board Themes",
    description:
      "You can now personalize the training board with a saved theme from Settings and keep that look every time you come back to solve.",
    features: [
      "A new Board theme setting in Settings lets you switch between four training palettes: Peck, Tournament, Slate, and Blueprint",
      "Your selected board theme persists on your account, so training keeps the same palette when you return",
      "Theme changes apply to the training board without interrupting the current puzzle state",
      "Peck remains the default theme, with three additional presets for players who want a different visual feel",
    ],
    date: "2026-03-09",
    learnMoreUrl: "/settings",
    actionLabel: "Choose a board theme",
  },
  {
    version: "2.6.0",
    title: "Control Training Pace Between Puzzles",
    description:
      "Training sessions now let you choose whether the next puzzle starts automatically or waits for a manual click, with the preference available in both active training and Settings.",
    features: [
      "A new Auto-start next puzzle preference lets you pause between puzzles and continue manually when you want a slower training rhythm",
      "The training sidebar now includes the same pace toggle, so you can switch between automatic and manual flow without leaving the session",
      "Manual pacing now works after both solved puzzles and skips, with a dedicated Next Puzzle action instead of forcing an immediate transition",
      "Training waits for your saved pace preference before rendering an active session, so a refresh cannot accidentally auto-advance the first puzzle",
      "Settings now roll back the auto-start toggle if saving fails, keeping the UI aligned with the value actually stored on your account",
    ],
    date: "2026-03-07",
    learnMoreUrl: "/training",
    actionLabel: "Adjust training pace",
  },
  {
    version: "2.5.0",
    title: "Smoother Board Controls and Faster Puzzle Flow",
    description:
      "Puzzle interactions are now more responsive across mouse and touch, promotion choices are anchored directly to the board, and move timing feels noticeably snappier in both training and review.",
    features: [
      "A new board interaction controller unifies drag and tap behavior, including touch dedupe logic and player-color drag guards",
      "Board highlights are clearer while solving: selected pieces, capture targets, and pending promotion squares are all visually distinct",
      "Promotion selection now opens near the destination square, adapts to board orientation, and repositions on resize",
      "Move pacing is faster with reduced animation and opponent-response delays for quicker puzzle throughput",
      "Puzzle/timer internals were hardened with cancellable async timing, stable timer controls, and memoized board surfaces to reduce race conditions and render churn",
    ],
    date: "2026-03-06",
    learnMoreUrl: "/training",
    actionLabel: "Try the new board flow",
  },
  {
    version: "2.4.0",
    title: "Review Missed Lines and Open Puzzles in Lichess",
    description:
      "Training now keeps missed puzzles on the board so you can review the exact line before moving on, and each active puzzle includes a direct Lichess link when you want to inspect the original puzzle page.",
    features: [
      "Wrong answers no longer jump away immediately, so the current puzzle stays visible for post-failure review",
      "Step through the remaining solution move by move with Previous and Next controls, or use the left and right arrow keys",
      "The puzzle timer now pauses during failed-puzzle review and shows a clear paused state in the sidebar",
      "Advance to the next puzzle only when you're ready, making it easier to understand the line you missed before continuing",
      "A new View in Lichess button opens the current puzzle on lichess.org in a new tab without interrupting your training session",
    ],
    date: "2026-03-02",
    learnMoreUrl: "/training",
    actionLabel: "Try it in training",
  },
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
