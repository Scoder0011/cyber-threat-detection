import type { Alert } from "@/types/alert";

export function FusionTicker({ alerts }: { alerts: Alert[] }) {
  const latestAlert = alerts[0];

  return (
    <div className="border-b border-hairline bg-panel2 px-6 py-2 font-mono text-xs">
      {latestAlert ? (
        <p className="truncate text-dim">
          <span className="mr-2 text-flow">LATEST FUSION</span>
          <span className="text-ink">{latestAlert.summary}</span>
          <span className="mx-2 text-dim">·</span>
          <span className="text-signal-medium">
            {(latestAlert.fused_score * 100).toFixed(0)}% confidence
          </span>
        </p>
      ) : (
        <p className="text-dim">
          <span className="mr-2 text-flow">FUSION STREAM</span>
          Waiting for incoming alerts…
        </p>
      )}
    </div>
  );
}
