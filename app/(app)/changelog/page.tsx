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
      variant={featured ? "default" : "ghost"}
      size="sm"
      className={
        featured
          ? "gap-2 shadow-sm"
          : "gap-2 px-0 text-primary hover:bg-transparent hover:text-primary/80"
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
    <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/8 via-background to-accent/30">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
            v{entry.version}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-muted-foreground shadow-sm">
            <Clock3 className="h-3 w-3" />
            {formatChangelogDate(entry.date)}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-linear-to-br from-primary to-primary/70 p-3 text-primary-foreground shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">{entry.title}</CardTitle>
            <CardDescription className="text-sm">
              Latest release
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{entry.description}</p>
        <ul className="space-y-2">
          {entry.features.map((feature, index) => (
            <li
              key={`${entry.version}-${index}`}
              className="flex items-start gap-2 text-sm text-foreground/90"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
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
          className="absolute left-[0.4rem] top-8 h-[calc(100%-1rem)] w-px bg-border"
        />
      ) : null}
      <span
        aria-hidden="true"
        className="absolute left-0 top-7 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-sm"
      />
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/80">
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
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
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
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/6 via-background to-accent/25 p-6 shadow-sm sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-accent/60 blur-3xl"
        />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            App updates
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Changelog
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Product updates, without the noise. See what shipped and jump
              straight into it.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
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
            Earlier product updates.
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
