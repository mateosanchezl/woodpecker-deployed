import assert from "node:assert/strict";
import test from "node:test";
import {
  CHANGELOG_ENTRIES,
  getUnreadChangelogEntries,
} from "@/lib/changelog";

test("getUnreadChangelogEntries shows only the latest entry when nothing has been dismissed", () => {
  assert.deepEqual(getUnreadChangelogEntries(null), [
    CHANGELOG_ENTRIES[0],
  ]);
});

test("getUnreadChangelogEntries returns nothing when the latest entry is dismissed", () => {
  assert.deepEqual(
    getUnreadChangelogEntries(CHANGELOG_ENTRIES[0]?.version),
    [],
  );
});

test("getUnreadChangelogEntries returns every entry newer than the dismissed version", () => {
  const dismissedEntry = CHANGELOG_ENTRIES[2];
  assert.ok(dismissedEntry);

  assert.deepEqual(
    getUnreadChangelogEntries(dismissedEntry.version),
    CHANGELOG_ENTRIES.slice(0, 2),
  );
});

test("getUnreadChangelogEntries falls back to the latest entry for unknown stored versions", () => {
  assert.deepEqual(getUnreadChangelogEntries("unknown-version"), [
    CHANGELOG_ENTRIES[0],
  ]);
});
