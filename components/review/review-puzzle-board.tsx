"use client";

import { memo, useState, useCallback, useMemo, useRef } from "react";
import { Chessboard } from "react-chessboard";
import type { ChessboardOptions } from "react-chessboard";
import { Chess } from "chess.js";
import { useChessPuzzle } from "@/hooks/use-chess-puzzle";
import { useBoardInteractionController } from "@/hooks/use-board-interaction-controller";
import { usePuzzleTimer } from "@/hooks/use-puzzle-timer";
import type {
  Square,
  PuzzleStatus,
  PromotionState,
  BoardOrientation,
} from "@/lib/chess/types";
import { ANIMATION_DURATION } from "@/lib/chess/types";
import {
  parseUciMove,
  parseSolutionMoves,
  getOrientationFromFen,
  sleep,
} from "@/lib/chess/puzzle-engine";
import {
  getBoardThemeSquareStyles,
  type BoardThemeId,
} from "@/lib/chess/board-themes";
import { PromotionDialog } from "@/components/training/promotion-dialog";
import { PuzzleFeedback } from "@/components/training/puzzle-feedback";
import { ChessboardStage } from "@/components/chess/chessboard-stage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock3, Eye, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { formatTime } from "@/hooks/use-puzzle-timer";
import { hasMateInOneTheme } from "@/lib/chess/training-themes";

interface ReviewPuzzleBoardProps {
  fen: string;
  moves: string;
  puzzleRating: number;
  themes: string[];
  successRate: number;
  totalAttempts: number;
  correctAttempts: number;
  boardTheme: BoardThemeId;
  canGoToNextPuzzle?: boolean;
  onNextPuzzle?: () => void;
  onComplete?: (
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[],
  ) => void;
}

const customBoardStyle: React.CSSProperties = {
  borderRadius: "12px",
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

function addInsetShadow(
  existingShadow: string | undefined,
  shadow: string,
): string {
  return existingShadow ? `${existingShadow}, ${shadow}` : shadow;
}

interface ReviewBoardSurfaceProps {
  chessboardOptions: ChessboardOptions;
  isWalkthrough: boolean;
  status: PuzzleStatus;
  promotionState: PromotionState;
  orientation: BoardOrientation;
  onSelectPromotion: (piece: "q" | "r" | "b" | "n") => void;
  onCancelPromotion: () => void;
}

const ReviewBoardSurface = memo(function ReviewBoardSurface({
  chessboardOptions,
  isWalkthrough,
  status,
  promotionState,
  orientation,
  onSelectPromotion,
  onCancelPromotion,
}: ReviewBoardSurfaceProps) {
  const boardContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ChessboardStage
      board={
        <div ref={boardContainerRef} className="absolute inset-0">
          <Chessboard options={chessboardOptions} />
          {!isWalkthrough && <PuzzleFeedback status={status} />}
          {!isWalkthrough && (
            <PromotionDialog
              isOpen={promotionState.isOpen}
              color={promotionState.color}
              anchorSquare={promotionState.to}
              boardOrientation={orientation}
              boardContainerRef={boardContainerRef}
              onSelect={onSelectPromotion}
              onCancel={onCancelPromotion}
            />
          )}
        </div>
      }
    />
  );
});

ReviewBoardSurface.displayName = "ReviewBoardSurface";

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
  boardTheme,
  canGoToNextPuzzle = false,
  onNextPuzzle,
  onComplete,
}: ReviewPuzzleBoardProps) {
  const puzzleKey = `${fen}::${moves}`;
  const [reviewMode, setReviewMode] = useState<ReviewMode>("solving");
  const [boardEpoch, setBoardEpoch] = useState(0);

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
  const allowAnyFinalCheckmate = hasMateInOneTheme(themes);

  const {
    position,
    status,
    lastMove,
    isPlayerTurn,
    promotionState,
    makePlayerMove,
    handlePromotionSelect,
    cancelPromotion,
    getLegalMoveTargets,
    reset: resetPuzzle,
  } = useChessPuzzle({
    fen,
    solutionMoves: moves,
    allowAnyFinalCheckmate,
    onCorrectMove: () => {},
    onIncorrectMove: () => {
      timer.controls.pause();
    },
    onPuzzleComplete: (isCorrect, finalMoves) => {
      timer.controls.pause();
      if (isCorrect) {
        setReviewMode("complete");
        onComplete?.(true, timer.controls.getTime(), finalMoves);
      } else {
        setReviewMode("failed");
        onComplete?.(false, timer.controls.getTime(), finalMoves);
      }
    },
    onReady: () => {
      if (reviewMode === "solving") {
        timer.controls.start();
      }
    },
  });

  const canInteract =
    reviewMode === "solving" && status !== "incorrect" && status !== "complete";
  const playerColor = orientation === "white" ? "w" : "b";

  const {
    selectedSquare,
    legalTargets,
    allowDragging,
    canDragPiece,
    dragActivationDistance,
    handlePieceDrop,
    handleSquareClick,
    clearSelection,
  } = useBoardInteractionController({
    canInteract,
    isPlayerTurn,
    playerColor,
    makePlayerMove,
    getLegalMoveTargets,
  });

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

  const handleRetry = useCallback(() => {
    setReviewMode("solving");
    clearSelection();
    setBoardEpoch((prev) => prev + 1);
    setIsAutoPlaying(false);
    autoPlayRef.current = false;
    timer.controls.reset();
    resetPuzzle();
  }, [clearSelection, timer.controls, resetPuzzle]);

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

    if (selectedSquare && canInteract && !isWalkthrough) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        boxShadow: addInsetShadow(
          styles[selectedSquare]?.boxShadow as string | undefined,
          "inset 0 0 0 3px rgba(59, 130, 246, 0.8)",
        ),
      };
    }

    if (canInteract && !isWalkthrough) {
      legalTargets.forEach(({ to, isCapture }) => {
        const currentStyle = styles[to] ?? {};

        styles[to] = {
          ...currentStyle,
          ...(isCapture
            ? {
                boxShadow: addInsetShadow(
                  currentStyle.boxShadow as string | undefined,
                  "inset 0 0 0 4px rgba(239, 68, 68, 0.72)",
                ),
              }
            : {
                backgroundImage:
                  "radial-gradient(circle, rgba(15, 23, 42, 0.35) 22%, transparent 24%)",
                backgroundSize: "100% 100%",
              }),
        };
      });
    }

    if (canInteract && !isWalkthrough && promotionState.isOpen && promotionState.to) {
      const currentStyle = styles[promotionState.to] ?? {};
      styles[promotionState.to] = {
        ...currentStyle,
        backgroundColor: currentStyle.backgroundColor || "rgba(251, 191, 36, 0.28)",
        boxShadow: addInsetShadow(
          currentStyle.boxShadow as string | undefined,
          "inset 0 0 0 4px rgba(251, 191, 36, 0.82)",
        ),
      };
    }

    return styles;
  }, [
    displayLastMove,
    selectedSquare,
    legalTargets,
    canInteract,
    isWalkthrough,
    promotionState.isOpen,
    promotionState.to,
  ]);

  const boardThemeStyles = useMemo(
    () => getBoardThemeSquareStyles(boardTheme),
    [boardTheme],
  );

  const chessboardOptions: ChessboardOptions = useMemo(
    () => ({
      position: displayPosition,
      boardOrientation: orientation,
      onPieceDrop: handlePieceDrop,
      onSquareClick: handleSquareClick,
      allowDragging,
      canDragPiece,
      allowDragOffBoard: false,
      dragActivationDistance,
      clearArrowsOnPositionChange: false,
      animationDurationInMs: ANIMATION_DURATION,
      boardStyle: customBoardStyle,
      darkSquareStyle: boardThemeStyles.darkSquareStyle,
      lightSquareStyle: boardThemeStyles.lightSquareStyle,
      squareStyles: customSquareStyles,
    }),
    [
      displayPosition,
      orientation,
      handlePieceDrop,
      handleSquareClick,
      allowDragging,
      canDragPiece,
      dragActivationDistance,
      boardThemeStyles.darkSquareStyle,
      boardThemeStyles.lightSquareStyle,
      customSquareStyles,
    ],
  );

  const walkthroughComplete = walkthroughMoveIndex >= solutionArray.length;
  const showNextPuzzleAction = canGoToNextPuzzle && typeof onNextPuzzle === "function";
  const successRateToneClass =
    successRate >= 50 ? "text-amber-700 dark:text-amber-300" : "text-rose-700 dark:text-rose-300";

  return (
    <div className="flex w-full flex-col gap-4">
      <ReviewBoardSurface
        key={`${puzzleKey}:${boardEpoch}`}
        chessboardOptions={chessboardOptions}
        isWalkthrough={isWalkthrough}
        status={status}
        promotionState={promotionState}
        orientation={orientation}
        onSelectPromotion={handlePromotionSelect}
        onCancelPromotion={cancelPromotion}
      />

      <Card className="py-0">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="text-center text-sm font-medium sm:text-base">
            <ReviewStatusText
              reviewMode={reviewMode}
              puzzleStatus={status}
              walkthroughIndex={walkthroughMoveIndex}
              totalMoves={solutionArray.length}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {reviewMode === "solving" && (
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                <span className="font-mono">{formatTime(timer.timeMs)}</span>
              </span>
            )}
            <span className="rounded-full border px-3 py-1 font-mono">
              {puzzleRating}
            </span>
            <span className={cn("rounded-full border px-3 py-1 font-medium", successRateToneClass)}>
              {successRate}% success
            </span>
            <span className="rounded-full border px-3 py-1 text-muted-foreground">
              {correctAttempts}/{totalAttempts} correct
            </span>
            {reviewMode === "walkthrough" && (
              <span className="rounded-full border px-3 py-1 text-muted-foreground">
                Move {walkthroughMoveIndex} of {solutionArray.length}
              </span>
            )}
          </div>

          {themes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {themes.slice(0, 5).map((theme) => (
                <span key={theme} className="rounded-full border px-3 py-1">
                  {formatTheme(theme)}
                </span>
              ))}
              {themes.length > 5 && (
                <span className="rounded-full border px-3 py-1">
                  +{themes.length - 5} more
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {reviewMode === "failed" && (
              <>
                <Button onClick={initWalkthrough}>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Solution
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </>
            )}

            {reviewMode === "walkthrough" && (
              <>
                <Button
                  onClick={stepForward}
                  disabled={walkthroughComplete || isAutoPlaying}
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
                  aria-label={isAutoPlaying ? "Pause auto-play" : "Auto-play solution"}
                >
                  {isAutoPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </>
            )}

            {reviewMode === "complete" && (
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Solve Again
              </Button>
            )}

            {showNextPuzzleAction && (
              <Button variant="outline" onClick={onNextPuzzle}>
                <SkipForward className="mr-2 h-4 w-4" />
                Next Puzzle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
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
    if (walkthroughIndex === 0) {
      return <span>Starting position — step through the solution</span>;
    }

    if (walkthroughIndex >= totalMoves) {
      return <span className="text-green-600">Solution complete</span>;
    }

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
