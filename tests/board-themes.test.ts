import assert from "node:assert/strict";
import test from "node:test";
import {
  BOARD_THEME_IDS,
  BOARD_THEME_OPTIONS,
  getBoardTheme,
  resolveBoardTheme,
  type BoardThemeId,
} from "@/lib/chess/board-themes";
import { updateUserSettingsSchema } from "@/lib/validations/training";

const NEW_BOARD_THEMES: BoardThemeId[] = [
  "rosewood",
  "lagoon",
  "plum",
  "carbon",
];

test("all board theme ids resolve to definitions", () => {
  assert.equal(BOARD_THEME_OPTIONS.length, BOARD_THEME_IDS.length);

  for (const themeId of BOARD_THEME_IDS) {
    const theme = getBoardTheme(themeId);
    assert.equal(theme.id, themeId);
    assert.equal(resolveBoardTheme(themeId), themeId);
    assert.ok(theme.label.length > 0);
    assert.ok(theme.lightSquareColor.startsWith("oklch("));
    assert.ok(theme.darkSquareColor.startsWith("oklch("));
  }
});

test("new board themes are accepted by settings validation", () => {
  for (const boardTheme of NEW_BOARD_THEMES) {
    assert.equal(
      updateUserSettingsSchema.safeParse({ boardTheme }).success,
      true,
    );
  }
});

test("training settings validation accepts the completion sound preference", () => {
  assert.equal(
    updateUserSettingsSchema.safeParse({
      puzzleCompletionSoundEnabled: true,
    }).success,
    true,
  );
  assert.equal(
    updateUserSettingsSchema.safeParse({
      puzzleCompletionSoundEnabled: false,
    }).success,
    true,
  );
});

test("training settings validation accepts the puzzle theme visibility preference", () => {
  assert.equal(
    updateUserSettingsSchema.safeParse({
      showPuzzleThemes: true,
    }).success,
    true,
  );
  assert.equal(
    updateUserSettingsSchema.safeParse({
      showPuzzleThemes: false,
    }).success,
    true,
  );
});

test("unknown board theme ids fall back to the default theme", () => {
  assert.equal(resolveBoardTheme("not-a-theme"), "peck");
  assert.equal(getBoardTheme("not-a-theme").id, "peck");
});
