import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CHANGELOG_ENTRIES,
  LATEST_CHANGELOG_ENTRY,
  formatChangelogDate,
  type ChangelogEntry,
} from "@/lib/changelog";

function ReleaseAction({
  href,
  label,
  featured = false,
}: {
  href: string;
  label: string;
  featured?: boolean;
}) {
  return (
    <Button
      asChild
      variant={featured ? "outline" : "ghost"}
      size="sm"
      className={
        featured
          ? "gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
          : "gap-2 px-0 text-blue-700 hover:bg-transparent hover:text-blue-900 dark:text-blue-300 dark:hover:bg-transparent dark:hover:text-blue-100"
      }
    >
      <Link href={href}>
        {label}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </Button>
  );
}

function FeaturedReleaseCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <Card className="relative overflow-hidden border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
            v{entry.version}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-blue-700 shadow-sm dark:bg-blue-950/40 dark:text-blue-200">
            <Clock3 className="h-3 w-3" />
            {formatChangelogDate(entry.date)}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 p-3 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl text-blue-950 dark:text-blue-50">
              {entry.title}
            </CardTitle>
            <CardDescription className="text-sm text-blue-700/80 dark:text-blue-200/80">
              Latest release
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          {entry.description}
        </p>
        <ul className="space-y-2">
          {entry.features.map((feature, index) => (
            <li
              key={`${entry.version}-${index}`}
              className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {feature}
            </li>
          ))}
        </ul>
        {entry.learnMoreUrl && entry.actionLabel ? (
          <ReleaseAction
            href={entry.learnMoreUrl}
            label={entry.actionLabel}
            featured
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function TimelineReleaseCard({
  entry,
  isLast,
}: {
  entry: ChangelogEntry;
  isLast: boolean;
}) {
  return (
    <div className="relative pl-7">
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute left-[0.4rem] top-8 h-[calc(100%-1rem)] w-px bg-blue-200 dark:bg-blue-900/60"
        />
      ) : null}
      <span
        aria-hidden="true"
        className="absolute left-0 top-7 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm dark:border-slate-950"
      />
      <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              v{entry.version}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="h-3 w-3" />
              {formatChangelogDate(entry.date)}
            </span>
          </div>
          <div>
            <CardTitle className="text-lg">{entry.title}</CardTitle>
            <CardDescription className="mt-1">
              {entry.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {entry.features.map((feature, index) => (
              <li
                key={`${entry.version}-${index}`}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {feature}
              </li>
            ))}
          </ul>
          {entry.learnMoreUrl && entry.actionLabel ? (
            <ReleaseAction href={entry.learnMoreUrl} label={entry.actionLabel} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChangelogPage() {
  const previousEntries = CHANGELOG_ENTRIES.slice(1);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-2">
      <section className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-linear-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm dark:border-blue-900/60 dark:from-blue-950/30 dark:via-background dark:to-indigo-950/20 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/10"
        />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            App updates
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Changelog
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              See what shipped recently, revisit past releases, and jump straight
              into the features that changed how you train.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <Sparkles className="h-4 w-4" />
          Latest release
        </div>
        <FeaturedReleaseCard entry={LATEST_CHANGELOG_ENTRY} />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Previous updates
          </h2>
          <p className="text-sm text-muted-foreground">
            A running history of the improvements that shipped before the latest
            release.
          </p>
        </div>

        <div className="space-y-4">
          {previousEntries.map((entry, index) => (
            <TimelineReleaseCard
              key={entry.version}
              entry={entry}
              isLast={index === previousEntries.length - 1}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
