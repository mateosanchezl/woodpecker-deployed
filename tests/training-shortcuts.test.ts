import assert from "node:assert/strict";
import test from "node:test";
import { TRAINING_SHORTCUTS, isSpaceKey } from "@/lib/training/keyboard-shortcuts";

test("training shortcut metadata exposes aria-keyshortcuts and visible hints", () => {
  assert.equal(TRAINING_SHORTCUTS.skip.ariaKeyShortcuts, "S Escape");
  assert.deepEqual(TRAINING_SHORTCUTS.skip.hints, ["S"]);
  assert.equal(TRAINING_SHORTCUTS.timerToggle.ariaKeyShortcuts, "T");
  assert.equal(TRAINING_SHORTCUTS.previousMove.ariaKeyShortcuts, "ArrowLeft");
  assert.deepEqual(TRAINING_SHORTCUTS.previousMove.hints, ["\u2190"]);
  assert.equal(TRAINING_SHORTCUTS.nextMove.ariaKeyShortcuts, "ArrowRight Space");
  assert.deepEqual(TRAINING_SHORTCUTS.nextMove.hints, ["\u2192", "Space"]);
  assert.equal(TRAINING_SHORTCUTS.nextPuzzle.ariaKeyShortcuts, "Enter Space");
  assert.deepEqual(TRAINING_SHORTCUTS.nextPuzzle.hints, ["Enter"]);
});

test("isSpaceKey recognizes browser space key names", () => {
  assert.equal(isSpaceKey(" "), true);
  assert.equal(isSpaceKey("Spacebar"), true);
  assert.equal(isSpaceKey("Space"), false);
});
