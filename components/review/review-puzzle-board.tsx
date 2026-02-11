"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Chessboard } from "react-chessboard";
import type {
  ChessboardOptions,
  SquareHandlerArgs,
  PieceDropHandlerArgs,
} from "react-chessboard";
import { Chess } from "chess.js";
import { useChessPuzzle } from "@/hooks/use-chess-puzzle";
import { usePuzzleTimer } from "@/hooks/use-puzzle-timer";
import type { Square, PuzzleStatus } from "@/lib/chess/types";
import { ANIMATION_DURATION } from "@/lib/chess/types";
import {
  parseUciMove,
  parseSolutionMoves,
  getOrientationFromFen,
  sleep,
} from "@/lib/chess/puzzle-engine";
import { PromotionDialog } from "@/components/training/promotion-dialog";
import { PuzzleFeedback } from "@/components/training/puzzle-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, RotateCcw, ChevronRight, Play, Pause } from "lucide-react";
import { formatTime } from "@/hooks/use-puzzle-timer";

interface ReviewPuzzleBoardProps {
  fen: string;
  moves: string;
  puzzleRating: number;
  themes: string[];
  successRate: number;
  totalAttempts: number;
  correctAttempts: number;
  onComplete?: (
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[],
  ) => void;
}

// Board styling (same as training)
const customDarkSquareStyle: React.CSSProperties = {
  backgroundColor: "oklch(0.6 0.1 145)",
};

const customLightSquareStyle: React.CSSProperties = {
  backgroundColor: "oklch(0.96 0.03 145)",
};

const customBoardStyle: React.CSSProperties = {
  borderRadius: "12px",
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

type ReviewMode = "solving" | "failed" | "walkthrough" | "complete";

/**
 * Review-specific puzzle board with solution walkthrough capability.
 * After failure, users can step through the correct solution move by move.
 */
export function ReviewPuzzleBoard({
  fen,
  moves,
  puzzleRating,
  themes,
  successRate,
  totalAttempts,
  correctAttempts,
  onComplete,
}: ReviewPuzzleBoardProps) {
  const [reviewMode, setReviewMode] = useState<ReviewMode>("solving");
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  // Solution walkthrough state
  const [walkthroughPosition, setWalkthroughPosition] = useState(fen);
  const [walkthroughMoveIndex, setWalkthroughMoveIndex] = useState(0);
  const [walkthroughLastMove, setWalkthroughLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef(false);

  const timer = usePuzzleTimer();
  const solutionArray = parseSolutionMoves(moves);
  const orientation = getOrientationFromFen(fen);

  // Chess puzzle hook for solving mode
  const {
    position,
    status,
    lastMove,
    isPlayerTurn,
    promotionState,
    makePlayerMove,
    handlePromotionSelect,
    cancelPromotion,
    getLegalMoves,
    reset: resetPuzzle,
  } = useChessPuzzle({
    fen,
    solutionMoves: moves,
    onCorrectMove: () => {},
    onIncorrectMove: () => {
      timer.pause();
    },
    onPuzzleComplete: (isCorrect, finalMoves) => {
      timer.pause();
      if (isCorrect) {
        setReviewMode("complete");
        onComplete?.(true, timer.getTime(), finalMoves);
      } else {
        setReviewMode("failed");
        onComplete?.(false, timer.getTime(), finalMoves);
      }
    },
    onReady: () => {
      if (reviewMode === "solving") {
        timer.start();
      }
    },
  });

  // ----- SOLVING MODE HANDLERS -----

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (
        !isPlayerTurn ||
        !sourceSquare ||
        !targetSquare ||
        reviewMode !== "solving"
      ) {
        return false;
      }
      if (sourceSquare === targetSquare) return false;

      setSelectedSquare(null);
      setLegalMoves([]);
      return makePlayerMove(sourceSquare as Square, targetSquare as Square);
    },
    [isPlayerTurn, makePlayerMove, reviewMode],
  );

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (!isPlayerTurn || reviewMode !== "solving") return;

      const sq = square as Square;

      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (selectedSquare && legalMoves.includes(sq)) {
        makePlayerMove(selectedSquare, sq);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const moves = getLegalMoves(sq);
      if (moves.length > 0) {
        setSelectedSquare(sq);
        setLegalMoves(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [
      isPlayerTurn,
      selectedSquare,
      legalMoves,
      makePlayerMove,
      getLegalMoves,
      reviewMode,
    ],
  );

  // ----- WALKTHROUGH HANDLERS -----

  const initWalkthrough = useCallback(() => {
    setReviewMode("walkthrough");
    setWalkthroughPosition(fen);
    setWalkthroughMoveIndex(0);
    setWalkthroughLastMove(null);
    setIsAutoPlaying(false);
    autoPlayRef.current = false;
  }, [fen]);

  const stepForward = useCallback(() => {
    if (walkthroughMoveIndex >= solutionArray.length) return;

    const chess = new Chess();
    chess.load(fen);

    // Replay all moves up to and including current index
    for (let i = 0; i <= walkthroughMoveIndex; i++) {
      const parsed = parseUciMove(solutionArray[i]);
      chess.move({
        from: parsed.from,
        to: parsed.to,
        promotion: parsed.promotion,
      });
    }

    const lastParsed = parseUciMove(solutionArray[walkthroughMoveIndex]);
    setWalkthroughPosition(chess.fen());
    setWalkthroughLastMove({ from: lastParsed.from, to: lastParsed.to });
    setWalkthroughMoveIndex((prev) => prev + 1);
  }, [walkthroughMoveIndex, solutionArray, fen]);

  const autoPlaySolution = useCallback(async () => {
    if (isAutoPlaying) {
      autoPlayRef.current = false;
      setIsAutoPlaying(false);
      return;
    }

    setIsAutoPlaying(true);
    autoPlayRef.current = true;

    const chess = new Chess();
    chess.load(fen);

    // Replay up to current position first
    for (let i = 0; i < walkthroughMoveIndex; i++) {
      const parsed = parseUciMove(solutionArray[i]);
      chess.move({
        from: parsed.from,
        to: parsed.to,
        promotion: parsed.promotion,
      });
    }

    for (let i = walkthroughMoveIndex; i < solutionArray.length; i++) {
      if (!autoPlayRef.current) break;

      await sleep(600);
      if (!autoPlayRef.current) break;

      const parsed = parseUciMove(solutionArray[i]);
      chess.move({
        from: parsed.from,
        to: parsed.to,
        promotion: parsed.promotion,
      });

      setWalkthroughPosition(chess.fen());
      setWalkthroughLastMove({ from: parsed.from, to: parsed.to });
      setWalkthroughMoveIndex(i + 1);
    }

    setIsAutoPlaying(false);
    autoPlayRef.current = false;
  }, [isAutoPlaying, fen, walkthroughMoveIndex, solutionArray]);

  // ----- RETRY -----

  const handleRetry = useCallback(() => {
    setReviewMode("solving");
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsAutoPlaying(false);
    autoPlayRef.current = false;
    timer.reset();
    resetPuzzle();
  }, [timer, resetPuzzle]);

  // ----- RENDERING -----

  const isWalkthrough = reviewMode === "walkthrough";
  const displayPosition = isWalkthrough ? walkthroughPosition : position;
  const displayLastMove = isWalkthrough ? walkthroughLastMove : lastMove;

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (displayLastMove) {
      styles[displayLastMove.from] = {
        backgroundColor: "rgba(255, 255, 0, 0.3)",
      };
      styles[displayLastMove.to] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      };
    }

    if (selectedSquare && !isWalkthrough) {
      styles[selectedSquare] = { backgroundColor: "rgba(59, 130, 246, 0.5)" };
    }

    if (!isWalkthrough) {
      legalMoves.forEach((sq) => {
        styles[sq] = {
          ...styles[sq],
          backgroundImage:
            "radial-gradient(circle, rgba(0, 0, 0, 0.2) 25%, transparent 25%)",
          backgroundSize: "100% 100%",
        };
      });
    }

    return styles;
  }, [displayLastMove, selectedSquare, legalMoves, isWalkthrough]);

  const canInteract =
    reviewMode === "solving" && status !== "incorrect" && status !== "complete";

  const chessboardOptions: ChessboardOptions = useMemo(
    () => ({
      position: displayPosition,
      boardOrientation: orientation,
      onPieceDrop: handlePieceDrop,
      onSquareClick: handleSquareClick,
      allowDragging: canInteract,
      animationDurationInMs: ANIMATION_DURATION,
      boardStyle: customBoardStyle,
      darkSquareStyle: customDarkSquareStyle,
      lightSquareStyle: customLightSquareStyle,
      squareStyles: customSquareStyles,
    }),
    [
      displayPosition,
      orientation,
      handlePieceDrop,
      handleSquareClick,
      canInteract,
      customSquareStyles,
    ],
  );

  const walkthroughComplete = walkthroughMoveIndex >= solutionArray.length;

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full">
      {/* Board */}
      <div className="flex-1 w-full flex flex-col items-center gap-4">
        <div className="relative w-full max-w-140 aspect-square shadow-2xl rounded-xl overflow-hidden">
          <Chessboard options={chessboardOptions} />
          {!isWalkthrough && <PuzzleFeedback status={status} />}
          {!isWalkthrough && (
            <PromotionDialog
              isOpen={promotionState.isOpen}
              color={promotionState.color}
              onSelect={handlePromotionSelect}
              onCancel={cancelPromotion}
            />
          )}
        </div>

        {/* Status text */}
        <div className="text-lg font-medium text-muted-foreground">
          <ReviewStatusText
            reviewMode={reviewMode}
            puzzleStatus={status}
            walkthroughIndex={walkthroughMoveIndex}
            totalMoves={solutionArray.length}
          />
        </div>
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Timer (solving mode only) */}
        {reviewMode === "solving" && (
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <div className="font-mono text-3xl tabular-nums font-medium">
                  {formatTime(timer.timeMs)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Time</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Puzzle info */}
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating</span>
              <span className="font-mono text-sm font-medium">
                {puzzleRating}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Your success rate
              </span>
              <span
                className={`font-mono text-sm font-medium ${
                  successRate >= 50 ? "text-amber-600" : "text-rose-600"
                }`}
              >
                {successRate}%
                <span className="text-muted-foreground text-xs ml-1">
                  ({correctAttempts}/{totalAttempts})
                </span>
              </span>
            </div>
            {themes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {themes.slice(0, 5).map((theme) => (
                  <span
                    key={theme}
                    className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                  >
                    {formatTheme(theme)}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {/* Failed state: show solution or retry */}
          {reviewMode === "failed" && (
            <>
              <Button onClick={initWalkthrough} className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Show Solution
              </Button>
              <Button
                variant="outline"
                onClick={handleRetry}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </>
          )}

          {/* Walkthrough state: step through or auto-play */}
          {reviewMode === "walkthrough" && (
            <>
              <div className="flex gap-2">
                <Button
                  onClick={stepForward}
                  disabled={walkthroughComplete || isAutoPlaying}
                  className="flex-1"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {walkthroughComplete ? "Done" : "Next Move"}
                </Button>
                <Button
                  variant="outline"
                  onClick={autoPlaySolution}
                  disabled={walkthroughComplete}
                  size="icon"
                  title={isAutoPlaying ? "Pause" : "Auto-play"}
                >
                  {isAutoPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Move {walkthroughMoveIndex} of {solutionArray.length}
              </div>
              <Button
                variant="outline"
                onClick={handleRetry}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </>
          )}

          {/* Complete state: retry */}
          {reviewMode === "complete" && (
            <Button variant="outline" onClick={handleRetry} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Solve Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewStatusText({
  reviewMode,
  puzzleStatus,
  walkthroughIndex,
  totalMoves,
}: {
  reviewMode: ReviewMode;
  puzzleStatus: PuzzleStatus;
  walkthroughIndex: number;
  totalMoves: number;
}) {
  if (reviewMode === "walkthrough") {
    if (walkthroughIndex === 0)
      return <span>Starting position — step through the solution</span>;
    if (walkthroughIndex >= totalMoves)
      return <span className="text-green-600">Solution complete</span>;
    // Determine whose move it is in walkthrough
    return (
      <span className="text-blue-600">
        Solution move {walkthroughIndex} of {totalMoves}
      </span>
    );
  }

  if (reviewMode === "failed") {
    return (
      <span className="text-red-600">
        Incorrect — review the solution or try again
      </span>
    );
  }

  if (reviewMode === "complete") {
    return <span className="text-green-600">Solved correctly!</span>;
  }

  // Solving mode — use standard status text
  switch (puzzleStatus) {
    case "loading":
      return <span>Loading puzzle...</span>;
    case "opponent_turn":
      return <span className="animate-pulse">Opponent moving...</span>;
    case "player_turn":
      return <span>Your move</span>;
    case "correct":
      return <span className="text-green-600">Correct!</span>;
    case "incorrect":
      return <span className="text-red-600">Incorrect</span>;
    case "complete":
      return <span className="text-green-600">Puzzle complete!</span>;
    default:
      return null;
  }
}
