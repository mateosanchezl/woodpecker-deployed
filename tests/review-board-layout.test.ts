import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ChessboardStage,
  CHESSBOARD_STAGE_BOARD_CLASS,
  CHESSBOARD_STAGE_CONTENT_CLASS,
  CHESSBOARD_STAGE_MAX_WIDTH_CLASS,
} from "@/components/chess/chessboard-stage";

test("ChessboardStage applies the shared review/training sizing contract", () => {
  const html = renderToStaticMarkup(
    createElement(
      ChessboardStage,
      {
        board: createElement("div", null, "board"),
      },
      createElement("div", null, "footer"),
    ),
  );

  assert.ok(CHESSBOARD_STAGE_BOARD_CLASS.includes(CHESSBOARD_STAGE_MAX_WIDTH_CLASS));
  assert.ok(CHESSBOARD_STAGE_CONTENT_CLASS.includes(CHESSBOARD_STAGE_MAX_WIDTH_CLASS));
  assert.match(html, /max-w-\[700px\]/);
  assert.match(html, /aspect-square/);
  assert.match(html, /shadow-2xl/);
});

test("training and review boards both use the shared ChessboardStage wrapper", () => {
  const reviewSource = readFileSync(
    new URL("../components/review/review-puzzle-board.tsx", import.meta.url),
    "utf8",
  );
  const trainingSource = readFileSync(
    new URL("../components/training/puzzle-board.tsx", import.meta.url),
    "utf8",
  );

  assert.match(reviewSource, /ChessboardStage/);
  assert.match(trainingSource, /ChessboardStage/);
});
