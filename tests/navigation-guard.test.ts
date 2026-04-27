import assert from "node:assert/strict";
import test from "node:test";
import { getLocationPathWithSearch } from "@/hooks/use-navigation-guard";

test("getLocationPathWithSearch preserves training session query params", () => {
  assert.equal(
    getLocationPathWithSearch({
      pathname: "/training",
      search: "?setId=set-1&cycleId=cycle-1",
      hash: "",
    }),
    "/training?setId=set-1&cycleId=cycle-1",
  );
});

test("getLocationPathWithSearch preserves hashes with query strings", () => {
  assert.equal(
    getLocationPathWithSearch({
      pathname: "/training",
      search: "?setId=set-1",
      hash: "#board",
    }),
    "/training?setId=set-1#board",
  );
});
