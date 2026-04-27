import type { AppBootstrapPuzzleSet } from "@/lib/app-bootstrap";

export interface AppHeaderBreadcrumb {
  label: string;
  href?: string;
}

export type ResumeTrainingSet = Pick<
  AppBootstrapPuzzleSet,
  "id" | "name" | "currentCycleId"
>;

type SearchParamsLike =
  | string
  | URLSearchParams
  | {
      get: (name: string) => string | null;
    };

const APP_ROUTE_TITLES: Record<string, string> = {
  "/achievements": "Achievements",
  "/changelog": "Changelog",
  "/dashboard": "Dashboard",
  "/leaderboard": "Leaderboard",
  "/progress": "Progress",
  "/settings": "Settings",
  "/support": "Support",
  "/training": "Training",
};

function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) {
    return "/";
  }

  const [pathOnly] = pathname.split("?");
  const normalized = pathOnly.replace(/\/+$/, "");
  return normalized || "/";
}

function titleCaseSegment(segment: string): string {
  const readableSegment = decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .trim();

  if (!readableSegment) {
    return "Dashboard";
  }

  return readableSegment.replace(/\b\w/g, (character) =>
    character.toUpperCase(),
  );
}

function readSearchParam(
  searchParams: SearchParamsLike | null | undefined,
  key: string,
): string | null {
  if (!searchParams) {
    return null;
  }

  if (typeof searchParams === "string") {
    const params = new URLSearchParams(
      searchParams.startsWith("?") ? searchParams.slice(1) : searchParams,
    );
    return params.get(key);
  }

  return searchParams.get(key);
}

export function getAppHeaderBreadcrumbs(
  pathname: string | null | undefined,
): AppHeaderBreadcrumb[] {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname.startsWith("/training/new")) {
    return [
      { label: "Training", href: "/training" },
      { label: "New Set" },
    ];
  }

  if (normalizedPathname.startsWith("/training/review")) {
    return [
      { label: "Training", href: "/training" },
      { label: "Review" },
    ];
  }

  const exactTitle = APP_ROUTE_TITLES[normalizedPathname];
  if (exactTitle) {
    return [{ label: exactTitle }];
  }

  const lastSegment = normalizedPathname.split("/").filter(Boolean).at(-1);
  return [{ label: titleCaseSegment(lastSegment ?? "") }];
}

export function getResumeTrainingSet<TSet extends ResumeTrainingSet>(
  sets: readonly TSet[] | null | undefined,
): (TSet & { currentCycleId: string }) | null {
  const resumeSet = sets?.find(
    (set): set is TSet & { currentCycleId: string } =>
      typeof set.currentCycleId === "string" && set.currentCycleId.length > 0,
  );

  return resumeSet ?? null;
}

export function getResumeTrainingHref(
  set: ResumeTrainingSet & { currentCycleId: string },
): string {
  const params = new URLSearchParams({
    setId: set.id,
    cycleId: set.currentCycleId,
  });

  return `/training?${params.toString()}`;
}

export function isActiveResumeTrainingPath({
  pathname,
  searchParams,
  resumeSet,
}: {
  pathname: string | null | undefined;
  searchParams: SearchParamsLike | null | undefined;
  resumeSet: ResumeTrainingSet & { currentCycleId: string };
}): boolean {
  if (normalizePathname(pathname) !== "/training") {
    return false;
  }

  return (
    readSearchParam(searchParams, "setId") === resumeSet.id &&
    readSearchParam(searchParams, "cycleId") === resumeSet.currentCycleId
  );
}

export function shouldShowResumeTraining({
  pathname,
  searchParams,
  resumeSet,
}: {
  pathname: string | null | undefined;
  searchParams: SearchParamsLike | null | undefined;
  resumeSet: (ResumeTrainingSet & { currentCycleId: string }) | null;
}): boolean {
  if (!resumeSet) {
    return false;
  }

  return !isActiveResumeTrainingPath({
    pathname,
    searchParams,
    resumeSet,
  });
}
