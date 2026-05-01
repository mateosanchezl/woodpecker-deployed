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

test("review board keeps a fixed square and fixed-height controls", () => {
  const reviewSource = readFileSync(
    new URL("../components/review/review-puzzle-board.tsx", import.meta.url),
    "utf8",
  );

  assert.match(reviewSource, /boardTestId="review-board"/);
  assert.match(reviewSource, /REVIEW_BOARD_SQUARE_CLASS[\s\S]*max-w-\[760px\]/);
  assert.match(reviewSource, /REVIEW_BOARD_SQUARE_CLASS[\s\S]*shadow-none/);
  assert.match(reviewSource, /REVIEW_BOARD_CONTROLS_CLASS[\s\S]*h-\[190px\]/);
  assert.match(reviewSource, /REVIEW_BOARD_CONTROLS_CLASS[\s\S]*sm:h-\[156px\]/);
  assert.match(reviewSource, /REVIEW_BOARD_CONTROLS_CLASS[\s\S]*lg:h-\[148px\]/);
});
