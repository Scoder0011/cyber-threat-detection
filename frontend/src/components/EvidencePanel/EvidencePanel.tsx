import type { Alert } from "@/types/alert";

export function EvidencePanel({ alert }: { alert: Alert }) {
  return (
    <div className="rounded-lg border border-hairline bg-panel p-4">
      <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-ink">
        Bot Evidence
      </h3>
      <div className="space-y-2">
        {alert.bot_results.map((b) => (
          <div
            key={b.bot_id}
            className="flex items-center justify-between rounded border border-hairline/70 bg-panel2 px-3 py-2"
          >
            <div>
              <p className="font-mono text-xs text-ink">{b.bot_name}</p>
              <p className="font-mono text-[10px] text-dim">
                {new Date(b.triggered_at).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-flow">{(b.score * 100).toFixed(0)}% score</p>
              <p className="font-mono text-[10px] text-dim">
                {(b.confidence * 100).toFixed(0)}% confidence
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}