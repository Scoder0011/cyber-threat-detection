import { useEffect, useState } from "react";
import clsx from "clsx";
import { api } from "@/api/client";
import type { BotHealth } from "@/types/alert";

const STATUS_COLOR: Record<BotHealth["status"], string> = {
  online: "bg-signal-low",
  degraded: "bg-signal-medium",
  offline: "bg-signal-critical",
};

export function BotHealthPanel() {
  const [bots, setBots] = useState<BotHealth[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const poll = () =>
      api
        .getBotHealth()
        .then((data) => mounted && setBots(data))
        .catch((err) => mounted && setError(String(err)));
    poll();
    const id = setInterval(poll, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="rounded-lg border border-hairline bg-panel p-4">
      <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-ink">
        Bot Registry
      </h3>
      {error && <p className="font-mono text-xs text-signal-critical">{error}</p>}
      <ul className="space-y-2">
        {bots.map((b) => (
          <li key={b.bot_id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={clsx("h-1.5 w-1.5 rounded-full", STATUS_COLOR[b.status])} />
              <span className="font-mono text-ink">{b.bot_name}</span>
            </div>
            <span className="font-mono text-dim">{b.latency_ms.toFixed(0)}ms</span>
          </li>
        ))}
        {bots.length === 0 && !error && (
          <li className="font-mono text-xs text-dim">connecting to bot registry…</li>
        )}
      </ul>
    </div>
  );
}