import assert from "node:assert/strict";
import test from "node:test";
import {
  doesMoveDeliverCheckmate,
  isAcceptedPuzzleMove,
} from "@/lib/chess/puzzle-engine";

const MULTI_MATE_FEN = "7k/6Q1/5K2/8/8/8/8/8 w - - 0 1";

test("doesMoveDeliverCheckmate detects alternate mate-in-1 moves", () => {
  assert.equal(doesMoveDeliverCheckmate(MULTI_MATE_FEN, "f6", "g6"), true);
  assert.equal(doesMoveDeliverCheckmate(MULTI_MATE_FEN, "g7", "h6"), false);
});

test("isAcceptedPuzzleMove keeps exact-line validation by default", () => {
  assert.equal(
    isAcceptedPuzzleMove({
      fen: MULTI_MATE_FEN,
      from: "f6",
      to: "g6",
      expectedUci: "f6f7",
    }),
    false,
  );
});

test("isAcceptedPuzzleMove accepts alternate checkmates on the final ply when enabled", () => {
  assert.equal(
    isAcceptedPuzzleMove({
      fen: MULTI_MATE_FEN,
      from: "f6",
      to: "g6",
      expectedUci: "f6f7",
      allowAnyFinalCheckmate: true,
      isFinalExpectedMove: true,
    }),
    true,
  );
});

test("isAcceptedPuzzleMove does not accept alternate mates before the final ply", () => {
  assert.equal(
    isAcceptedPuzzleMove({
      fen: MULTI_MATE_FEN,
      from: "f6",
      to: "g6",
      expectedUci: "f6f7",
      allowAnyFinalCheckmate: true,
      isFinalExpectedMove: false,
    }),
    false,
  );
});
