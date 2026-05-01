"use client";

import {
  memo,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { Chessboard } from "react-chessboard";
import type { ChessboardOptions } from "react-chessboard";
import { Chess } from "chess.js";
import { useChessPuzzle } from "@/hooks/use-chess-puzzle";
import { useBoardInteractionController } from "@/hooks/use-board-interaction-controller";
import { usePuzzleTimer, formatTime } from "@/hooks/use-puzzle-timer";
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
} from "@/lib/chess/puzzle-engine";
import {
  getBoardThemeSquareStyles,
  type BoardThemeId,
} from "@/lib/chess/board-themes";
import { PromotionDialog } from "@/components/training/promotion-dialog";
import { PuzzleFeedback } from "@/components/training/puzzle-feedback";
import { ShortcutHints } from "@/components/training/shortcut-hints";
import { ChessboardStage } from "@/components/chess/chessboard-stage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Loader2,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { hasMateInOneTheme } from "@/lib/chess/training-themes";
import {
  isPlainShortcutEvent,
  isSpaceKey,
  shouldIgnoreTrainingShortcut,
  TRAINING_SHORTCUTS,
} from "@/lib/training/keyboard-shortcuts";

interface ReviewPuzzleBoardProps {
  fen: string;
  moves: string;
  themes: string[];
  boardTheme: BoardThemeId;
  canGoToNextPuzzle?: boolean;
  isSavingResult?: boolean;
  onNextPuzzle?: () => void;
  onComplete?: (
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[],
  ) => void;
}

export const REVIEW_BOARD_SQUARE_CLASS =
  "max-w-[760px] rounded-lg shadow-none";
export const REVIEW_BOARD_CONTROLS_CLASS =
  "h-[190px] overflow-hidden sm:h-[156px] lg:h-[148px]";

const customBoardStyle: React.CSSProperties = {
  borderRadius: "8px",
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
  children: ReactNode;
  onSelectPromotion: (piece: "q" | "r" | "b" | "n") => void;
  onCancelPromotion: () => void;
}

const ReviewBoardSurface = memo(function ReviewBoardSurface({
  chessboardOptions,
  isWalkthrough,
  status,
  promotionState,
  orientation,
  children,
  onSelectPromotion,
  onCancelPromotion,
}: ReviewBoardSurfaceProps) {
  const boardContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ChessboardStage
      className="gap-3"
      boardClassName={REVIEW_BOARD_SQUARE_CLASS}
      contentClassName={REVIEW_BOARD_CONTROLS_CLASS}
      boardTestId="review-board"
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
    >
      {children}
    </ChessboardStage>
  );
});

ReviewBoardSurface.displayName = "ReviewBoardSurface";

type ReviewMode = "solving" | "failedReview" | "complete";

/**
 * Review-specific puzzle board. Review results only mutate ReviewQueueItem rows;
 * they do not create training attempts, XP, streak, or achievement progress.
 */
export function ReviewPuzzleBoard({
  fen,
  moves,
  themes,
  boardTheme,
  canGoToNextPuzzle = false,
  isSavingResult = false,
  onNextPuzzle,
  onComplete,
}: ReviewPuzzleBoardProps) {
  const puzzleKey = `${fen}::${moves}`;
  const [reviewMode, setReviewMode] = useState<ReviewMode>("solving");
  const [boardEpoch, setBoardEpoch] = useState(0);
  const [reviewStartFen, setReviewStartFen] = useState(fen);
  const [reviewStartMoveIndex, setReviewStartMoveIndex] = useState(0);
  const [reviewStartLastMove, setReviewStartLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [walkthroughPosition, setWalkthroughPosition] = useState(fen);
  const [walkthroughMoveIndex, setWalkthroughMoveIndex] = useState(0);
  const [walkthroughLastMove, setWalkthroughLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  const timer = usePuzzleTimer();
  const solutionArray = useMemo(() => parseSolutionMoves(moves), [moves]);
  const orientation = getOrientationFromFen(fen);
  const allowAnyFinalCheckmate = hasMateInOneTheme(themes);

  const {
    position,
    status,
    currentMoveIndex,
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
      const finalTime = timer.controls.getTime();
      timer.controls.pause();

      if (isCorrect) {
        setReviewMode("complete");
      } else {
        setReviewMode("failedReview");
        setReviewStartFen(position);
        setReviewStartMoveIndex(currentMoveIndex);
        setReviewStartLastMove(lastMove);
        setWalkthroughPosition(position);
        setWalkthroughMoveIndex(currentMoveIndex);
        setWalkthroughLastMove(lastMove);
      }

      onComplete?.(isCorrect, finalTime, finalMoves);
    },
    onReady: () => {
      if (reviewMode === "solving") {
        timer.controls.start();
      }
    },
  });

  const canInteract =
    reviewMode === "solving" &&
    !isSavingResult &&
    status !== "incorrect" &&
    status !== "complete";
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

  const setWalkthroughToMoveIndex = useCallback(
    (targetMoveIndex: number) => {
      if (reviewMode !== "failedReview") {
        return;
      }

      const clampedMoveIndex = Math.min(
        Math.max(targetMoveIndex, reviewStartMoveIndex),
        solutionArray.length,
      );
      const chess = new Chess();
      chess.load(reviewStartFen);

      let nextLastMove = reviewStartLastMove;

      for (
        let moveIndex = reviewStartMoveIndex;
        moveIndex < clampedMoveIndex;
        moveIndex += 1
      ) {
        const moveUci = solutionArray[moveIndex];
        if (!moveUci) {
          console.error("Missing review walkthrough move:", moveIndex);
          return;
        }

        const parsed = parseUciMove(moveUci);
        const result = chess.move({
          from: parsed.from,
          to: parsed.to,
          promotion: parsed.promotion,
        });

        if (!result) {
          console.error("Failed to play review walkthrough move:", moveUci);
          return;
        }

        nextLastMove = { from: parsed.from, to: parsed.to };
      }

      setWalkthroughPosition(chess.fen());
      setWalkthroughLastMove(nextLastMove);
      setWalkthroughMoveIndex(clampedMoveIndex);
    },
    [
      reviewMode,
      reviewStartFen,
      reviewStartLastMove,
      reviewStartMoveIndex,
      solutionArray,
    ],
  );

  const stepForward = useCallback(() => {
    if (walkthroughMoveIndex >= solutionArray.length) {
      return;
    }

    setWalkthroughToMoveIndex(walkthroughMoveIndex + 1);
  }, [walkthroughMoveIndex, solutionArray.length, setWalkthroughToMoveIndex]);

  const stepBackward = useCallback(() => {
    if (walkthroughMoveIndex <= reviewStartMoveIndex) {
      return;
    }

    setWalkthroughToMoveIndex(walkthroughMoveIndex - 1);
  }, [walkthroughMoveIndex, reviewStartMoveIndex, setWalkthroughToMoveIndex]);

  const handleRetry = useCallback(() => {
    setReviewMode("solving");
    clearSelection();
    setBoardEpoch((prev) => prev + 1);
    timer.controls.reset();
    resetPuzzle();
  }, [clearSelection, timer.controls, resetPuzzle]);

  const handleNextPuzzle = useCallback(() => {
    if (!canGoToNextPuzzle || isSavingResult) {
      return;
    }

    onNextPuzzle?.();
  }, [canGoToNextPuzzle, isSavingResult, onNextPuzzle]);

  const isWalkthrough = reviewMode === "failedReview";
  const displayPosition = isWalkthrough ? walkthroughPosition : position;
  const displayLastMove = isWalkthrough ? walkthroughLastMove : lastMove;
  const reviewStepsTotal = Math.max(0, solutionArray.length - reviewStartMoveIndex);
  const reviewStepsCompleted = Math.max(
    0,
    walkthroughMoveIndex - reviewStartMoveIndex,
  );
  const isReviewComplete = reviewStepsCompleted >= reviewStepsTotal;
  const reviewProgressPercent =
    reviewStepsTotal > 0
      ? Math.round(
          (Math.min(reviewStepsCompleted, reviewStepsTotal) /
            Math.max(1, reviewStepsTotal)) *
            100,
        )
      : 0;
  const canStepBackward = walkthroughMoveIndex > reviewStartMoveIndex;
  const showNextPuzzleAction =
    reviewMode !== "solving" &&
    canGoToNextPuzzle &&
    typeof onNextPuzzle === "function";

  useEffect(() => {
    const handleReviewKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && promotionState.isOpen) {
        event.preventDefault();
        cancelPromotion();
        return;
      }

      if (!isPlainShortcutEvent(event) || shouldIgnoreTrainingShortcut(event)) {
        return;
      }

      if (
        event.repeat &&
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
      ) {
        return;
      }

      if (event.key === "Escape" && selectedSquare) {
        event.preventDefault();
        clearSelection();
        return;
      }

      if (event.key === "ArrowRight" && reviewMode === "failedReview") {
        event.preventDefault();
        stepForward();
        return;
      }

      if (event.key === "ArrowLeft" && reviewMode === "failedReview") {
        event.preventDefault();
        stepBackward();
        return;
      }

      if (isSpaceKey(event.key)) {
        if (reviewMode === "failedReview") {
          event.preventDefault();
          if (isReviewComplete) {
            handleNextPuzzle();
          } else {
            stepForward();
          }
          return;
        }

        if (reviewMode === "complete" && showNextPuzzleAction) {
          event.preventDefault();
          handleNextPuzzle();
        }

        return;
      }

      if (
        event.key === "Enter" &&
        (reviewMode === "complete" || reviewMode === "failedReview") &&
        showNextPuzzleAction
      ) {
        event.preventDefault();
        handleNextPuzzle();
      }
    };

    window.addEventListener("keydown", handleReviewKeyDown);
    return () => window.removeEventListener("keydown", handleReviewKeyDown);
  }, [
    cancelPromotion,
    clearSelection,
    handleNextPuzzle,
    isReviewComplete,
    promotionState.isOpen,
    reviewMode,
    selectedSquare,
    showNextPuzzleAction,
    stepBackward,
    stepForward,
  ]);

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

  return (
    <ReviewBoardSurface
      key={`${puzzleKey}:${boardEpoch}`}
      chessboardOptions={chessboardOptions}
      isWalkthrough={isWalkthrough}
      status={status}
      promotionState={promotionState}
      orientation={orientation}
      onSelectPromotion={handlePromotionSelect}
      onCancelPromotion={cancelPromotion}
    >
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border bg-background p-3 shadow-sm">
        <div className="flex min-h-10 w-full flex-wrap items-center justify-center gap-2">
          <ReviewStatusText
            reviewMode={reviewMode}
            puzzleStatus={status}
            isSavingResult={isSavingResult}
            isReviewComplete={isReviewComplete}
          />

          {reviewMode === "solving" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              <span className="font-mono">{formatTime(timer.timeMs)}</span>
            </span>
          )}
        </div>

        {reviewMode === "failedReview" && reviewStepsTotal > 0 && (
          <div className="flex min-h-7 w-full items-center justify-center text-xs text-muted-foreground">
            <div className="flex w-full max-w-md items-center gap-3">
              <span className="shrink-0 whitespace-nowrap">
                Solution {Math.min(reviewStepsCompleted, reviewStepsTotal)} /{" "}
                {reviewStepsTotal}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all"
                  style={{ width: `${reviewProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {reviewMode !== "solving" && (
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            {reviewMode === "failedReview" && (
              <>
                <Button
                  variant="outline"
                  onClick={stepBackward}
                  disabled={!canStepBackward || isSavingResult}
                  aria-keyshortcuts={TRAINING_SHORTCUTS.previousMove.ariaKeyShortcuts}
                  className="min-w-[148px] bg-background"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  <span>Previous</span>
                  <ShortcutHints keys={TRAINING_SHORTCUTS.previousMove.hints} />
                </Button>
                <Button
                  variant="outline"
                  onClick={stepForward}
                  disabled={isReviewComplete || isSavingResult}
                  aria-keyshortcuts={TRAINING_SHORTCUTS.nextMove.ariaKeyShortcuts}
                  className="min-w-[190px] bg-background"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {isReviewComplete ? (
                    "Complete"
                  ) : (
                    <>
                      <span>Next Move</span>
                      <ShortcutHints keys={TRAINING_SHORTCUTS.nextMove.hints} />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isSavingResult}
                  className="min-w-[124px] bg-background"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </>
            )}

            {reviewMode === "complete" && (
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={isSavingResult}
                className="min-w-[156px] bg-background"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Solve Again
              </Button>
            )}

            {showNextPuzzleAction && (
              <Button
                onClick={handleNextPuzzle}
                disabled={isSavingResult}
                aria-keyshortcuts={TRAINING_SHORTCUTS.nextPuzzle.ariaKeyShortcuts}
                className="min-w-[190px]"
              >
                {isSavingResult ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SkipForward className="mr-2 h-4 w-4" />
                )}
                {isSavingResult ? (
                  "Saving"
                ) : (
                  <>
                    <span>Next Review</span>
                    <ShortcutHints keys={TRAINING_SHORTCUTS.nextPuzzle.hints} />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </ReviewBoardSurface>
  );
}

function ReviewStatusText({
  reviewMode,
  puzzleStatus,
  isSavingResult,
  isReviewComplete,
}: {
  reviewMode: ReviewMode;
  puzzleStatus: PuzzleStatus;
  isSavingResult: boolean;
  isReviewComplete: boolean;
}) {
  if (isSavingResult) {
    return (
      <StatusBadge
        icon={Loader2}
        label="Saving Result"
        tone="warning"
        iconClassName="animate-spin"
      />
    );
  }

  if (reviewMode === "failedReview") {
    if (isReviewComplete) {
      return (
        <StatusBadge
          icon={CheckCircle2}
          label="Solution Complete"
          tone="success"
        />
      );
    }

    return (
      <StatusBadge
        icon={AlertCircle}
        label="Review The Missed Line"
        tone="warning"
      />
    );
  }

  if (reviewMode === "complete") {
    return <StatusBadge icon={CheckCircle2} label="Solved" tone="success" />;
  }

  switch (puzzleStatus) {
    case "loading":
      return (
        <StatusBadge
          icon={Loader2}
          label="Loading Puzzle"
          tone="neutral"
          iconClassName="animate-spin"
        />
      );
    case "opponent_turn":
      return (
        <StatusBadge
          icon={Clock3}
          label="Opponent Moving"
          tone="info"
          iconClassName="animate-pulse"
        />
      );
    case "player_turn":
      return <StatusBadge icon={CircleDot} label="Your Move" tone="neutral" />;
    case "correct":
      return <StatusBadge icon={CheckCircle2} label="Correct" tone="success" />;
    case "incorrect":
      return <StatusBadge icon={AlertCircle} label="Incorrect" tone="danger" />;
    case "complete":
      return (
        <StatusBadge icon={CheckCircle2} label="Puzzle Complete" tone="success" />
      );
    default:
      return null;
  }
}

function StatusBadge({
  icon: Icon,
  label,
  tone,
  iconClassName,
}: {
  icon: typeof Loader2;
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium tracking-tight shadow-sm transition-colors",
        tone === "neutral" && "border-border bg-background text-foreground/80",
        tone === "info" && "border-sky-200/80 bg-sky-50 text-sky-700",
        tone === "success" && "border-emerald-200/80 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200/80 bg-amber-50 text-amber-700",
        tone === "danger" && "border-rose-200/80 bg-rose-50 text-rose-700",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border bg-white/90",
          tone === "neutral" && "border-border/80 text-foreground/70",
          tone === "info" && "border-sky-200/80 text-sky-700",
          tone === "success" && "border-emerald-200/80 text-emerald-700",
          tone === "warning" && "border-amber-200/80 text-amber-700",
          tone === "danger" && "border-rose-200/80 text-rose-700",
        )}
      >
        <Icon className={cn("h-3 w-3", iconClassName)} />
      </span>
      <span>{label}</span>
    </span>
  );
}
