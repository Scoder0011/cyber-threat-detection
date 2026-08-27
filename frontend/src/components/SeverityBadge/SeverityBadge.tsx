import clsx from "clsx";
import type { Severity } from "@/types/alert";

const CONFIG: Record<Severity, { label: string; dot: string; text: string }> = {
  critical: { label: "CRITICAL", dot: "bg-signal-critical", text: "text-signal-critical" },
  high: { label: "HIGH", dot: "bg-signal-high", text: "text-signal-high" },
  medium: { label: "MEDIUM", dot: "bg-signal-medium", text: "text-signal-medium" },
  low: { label: "LOW", dot: "bg-signal-low", text: "text-signal-low" },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = CONFIG[severity];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-panel2 px-2 py-0.5 font-mono text-[11px] tracking-wide",
        cfg.text
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}