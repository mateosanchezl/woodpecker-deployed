import * as React from "react";

import { cn } from "@/lib/utils";

export function XIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4", className)}
      {...props}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.188L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.153h7.594l5.243 6.932zm-1.298 19.479h2.039L6.486 3.24H4.298z" />
    </svg>
  );
}
