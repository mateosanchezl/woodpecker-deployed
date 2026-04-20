"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const CHESSBOARD_STAGE_MAX_WIDTH_CLASS = "max-w-[700px]";
export const CHESSBOARD_STAGE_ROOT_CLASS =
  "flex w-full flex-col items-center gap-4";
export const CHESSBOARD_STAGE_BOARD_CLASS = cn(
  "relative w-full aspect-square overflow-hidden rounded-xl shadow-2xl",
  CHESSBOARD_STAGE_MAX_WIDTH_CLASS,
);
export const CHESSBOARD_STAGE_CONTENT_CLASS = cn(
  "w-full",
  CHESSBOARD_STAGE_MAX_WIDTH_CLASS,
);

interface ChessboardStageProps {
  board: ReactNode;
  children?: ReactNode;
  className?: string;
  boardClassName?: string;
  contentClassName?: string;
  boardTestId?: string;
  boardPuzzleId?: string;
}

export function ChessboardStage({
  board,
  children,
  className,
  boardClassName,
  contentClassName,
  boardTestId,
  boardPuzzleId,
}: ChessboardStageProps) {
  return (
    <div className={cn(CHESSBOARD_STAGE_ROOT_CLASS, className)}>
      <div
        className={cn(CHESSBOARD_STAGE_BOARD_CLASS, boardClassName)}
        data-testid={boardTestId}
        data-puzzle-id={boardPuzzleId}
      >
        {board}
      </div>

      {children ? (
        <div className={cn(CHESSBOARD_STAGE_CONTENT_CLASS, contentClassName)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
