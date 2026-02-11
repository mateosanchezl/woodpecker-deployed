"use client";

import dynamic from "next/dynamic";

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false },
);

interface ChessDiagramProps {
  fen: string;
  caption?: string;
  width?: number;
}

export function ChessDiagram({ fen, caption, width = 400 }: ChessDiagramProps) {
  return (
    <figure className="my-8 flex flex-col items-center not-prose">
      <div className="rounded-lg overflow-hidden shadow-md border border-border">
        <Chessboard
          options={{
            position: fen,
            allowDragging: false,
          }}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm text-muted-foreground text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
