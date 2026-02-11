import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Lightbulb, CheckCircle2 } from "lucide-react";

type CalloutType = "info" | "warning" | "tip" | "success";

const icons: Record<CalloutType, React.ReactNode> = {
  info: <Info className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  tip: <Lightbulb className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5" />,
};

const styles: Record<CalloutType, string> = {
  info: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  tip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  success:
    "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4 not-prose",
        styles[type],
      )}
      role="note"
    >
      <span className="mt-0.5 shrink-0">{icons[type]}</span>
      <div className="min-w-0">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm [&>p]:mb-0">{children}</div>
      </div>
    </div>
  );
}
