import assert from "node:assert/strict";
import test from "node:test";
import {
  doesMoveDeliverCheckmate,
  doesUciMoveDeliverCheckmate,
  isAcceptedPuzzleMove,
} from "@/lib/chess/puzzle-engine";

const MULTI_MATE_FEN = "7k/6Q1/5K2/8/8/8/8/8 w - - 0 1";
const MULTI_PLY_FINAL_MATE_FEN = "6k1/5Q2/6K1/8/8/8/8/8 w - - 0 1";

test("doesMoveDeliverCheckmate detects alternate mate-in-1 moves", () => {
  assert.equal(doesMoveDeliverCheckmate(MULTI_MATE_FEN, "f6", "g6"), true);
  assert.equal(doesMoveDeliverCheckmate(MULTI_MATE_FEN, "g7", "h6"), false);
});

test("doesUciMoveDeliverCheckmate detects checkmating UCI moves", () => {
  assert.equal(doesUciMoveDeliverCheckmate(MULTI_MATE_FEN, "f6g6"), true);
  assert.equal(doesUciMoveDeliverCheckmate(MULTI_MATE_FEN, "g7h6"), false);
  assert.equal(doesUciMoveDeliverCheckmate(MULTI_MATE_FEN, "bad"), false);
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

test("isAcceptedPuzzleMove accepts alternate checkmates when the canonical final move is mate", () => {
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

test("isAcceptedPuzzleMove accepts alternate mates from a multi-ply final position", () => {
  assert.equal(
    isAcceptedPuzzleMove({
      fen: MULTI_PLY_FINAL_MATE_FEN,
      from: "f7",
      to: "g7",
      expectedUci: "f7e8",
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

test("isAcceptedPuzzleMove rejects alternate final mate when the canonical final move is not mate", () => {
  assert.equal(
    isAcceptedPuzzleMove({
      fen: MULTI_MATE_FEN,
      from: "f6",
      to: "g6",
      expectedUci: "g7g8",
      allowAnyFinalCheckmate: true,
      isFinalExpectedMove: true,
    }),
    false,
  );
});
