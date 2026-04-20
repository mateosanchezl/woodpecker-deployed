import assert from "node:assert/strict";
import test from "node:test";
import { hasMateInOneTheme, hasMateTheme } from "@/lib/chess/training-themes";

test("hasMateTheme returns true when any mate theme is present", () => {
  assert.equal(hasMateTheme(["fork", "mateIn2"]), true);
  assert.equal(hasMateTheme(["mate"]), true);
});

test("hasMateTheme ignores non-mate themes and empty lists", () => {
  assert.equal(hasMateTheme(["fork", "pin", "sacrifice"]), false);
  assert.equal(hasMateTheme([]), false);
});

test("hasMateInOneTheme only matches the explicit mate-in-1 tag", () => {
  assert.equal(hasMateInOneTheme(["mate", "mateIn1"]), true);
  assert.equal(hasMateInOneTheme(["mate", "mateIn2"]), false);
  assert.equal(hasMateInOneTheme([]), false);
});
