import assert from "node:assert/strict";
import test from "node:test";
import {
  getAppHeaderBreadcrumbs,
  getResumeTrainingHref,
  getResumeTrainingSet,
  isActiveResumeTrainingPath,
  shouldShowResumeTraining,
  type ResumeTrainingSet,
} from "@/lib/app-header";

function makeSet(
  overrides: Partial<ResumeTrainingSet> = {},
): ResumeTrainingSet {
  return {
    id: "set-a",
    name: "Set A",
    currentCycleId: null,
    ...overrides,
  };
}

test("getAppHeaderBreadcrumbs maps app routes to compact breadcrumbs", () => {
  assert.deepEqual(getAppHeaderBreadcrumbs("/dashboard"), [
    { label: "Dashboard" },
  ]);
  assert.deepEqual(getAppHeaderBreadcrumbs("/progress"), [
    { label: "Progress" },
  ]);
  assert.deepEqual(getAppHeaderBreadcrumbs("/settings"), [
    { label: "Settings" },
  ]);
  assert.deepEqual(getAppHeaderBreadcrumbs("/training/new"), [
    { label: "Training", href: "/training" },
    { label: "New Set" },
  ]);
  assert.deepEqual(getAppHeaderBreadcrumbs("/training/review"), [
    { label: "Training", href: "/training" },
    { label: "Review" },
  ]);
  assert.deepEqual(getAppHeaderBreadcrumbs("/custom-report"), [
    { label: "Custom Report" },
  ]);
});

test("getResumeTrainingSet selects the first set with an unfinished cycle", () => {
  const resumeSet = getResumeTrainingSet([
    makeSet({ id: "set-a", name: "Set A" }),
    makeSet({
      id: "set-b",
      name: "Set B",
      currentCycleId: "cycle-b",
    }),
    makeSet({
      id: "set-c",
      name: "Set C",
      currentCycleId: "cycle-c",
    }),
  ]);

  assert.equal(resumeSet?.id, "set-b");
  assert.equal(resumeSet?.currentCycleId, "cycle-b");
  assert.equal(getResumeTrainingSet([makeSet()]), null);
});

test("resume training visibility hides on the exact active training URL", () => {
  const resumeSet = makeSet({
    id: "set a",
    name: "Set A",
    currentCycleId: "cycle/a",
  }) as ResumeTrainingSet & { currentCycleId: string };

  assert.equal(
    getResumeTrainingHref(resumeSet),
    "/training?setId=set+a&cycleId=cycle%2Fa",
  );
  assert.equal(
    isActiveResumeTrainingPath({
      pathname: "/training",
      searchParams: "setId=set+a&cycleId=cycle%2Fa",
      resumeSet,
    }),
    true,
  );
  assert.equal(
    shouldShowResumeTraining({
      pathname: "/training",
      searchParams: "setId=set+a&cycleId=cycle%2Fa",
      resumeSet,
    }),
    false,
  );
  assert.equal(
    shouldShowResumeTraining({
      pathname: "/training",
      searchParams: "setId=set+a&cycleId=other",
      resumeSet,
    }),
    true,
  );
  assert.equal(
    shouldShowResumeTraining({
      pathname: "/dashboard",
      searchParams: "",
      resumeSet,
    }),
    true,
  );
  assert.equal(
    shouldShowResumeTraining({
      pathname: "/dashboard",
      searchParams: "",
      resumeSet: null,
    }),
    false,
  );
});
