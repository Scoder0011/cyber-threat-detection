import { useAlerts } from "@/hooks/useAlerts";
import { FusionTicker } from "@/components/FusionTicker";
import { AlertsTable } from "@/components/AlertsTable/AlertsTable";
import { BotHealthPanel } from "@/components/BotHealthPanel/BotHealthPanel";
import { ThroughputChart } from "@/charts/ThroughputChart";
import { ThreatClassChart } from "@/charts/ThreatClassChart";
import { ModeToggle } from "@/components/ModeToggle";
import { ChatWithAI } from "@/components/ChatWithAI/Chatwithai";

export function Dashboard() {
  const { alerts, wsStatus, loading, error } = useAlerts();

  return (
    <div className="flex flex-1 flex-col">
      <FusionTicker alerts={alerts} />

      <div className="flex items-center justify-between border-b border-hairline px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-semibold text-ink">Threat Overview</h1>
          <span
            className={`font-mono text-[10px] uppercase tracking-widest ${
              wsStatus === "open" ? "text-signal-low" : "text-dim"
            }`}
          >
            ● stream {wsStatus}
          </span>
        </div>
        <ModeToggle />
      </div>

      {error && (
        <p className="mx-6 mt-3 rounded border border-signal-critical/40 bg-signal-critical/10 px-3 py-2 font-mono text-xs text-signal-critical">
          Failed to load alerts: {error}
        </p>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 p-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <AlertsTable alerts={alerts} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ThroughputChart />
            <ThreatClassChart alerts={alerts} />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <BotHealthPanel />
          <div className="min-h-[320px] flex-1">
            <ChatWithAI />
          </div>
        </div>
      </div>

      {loading && (
        <p className="px-6 pb-4 font-mono text-xs text-dim">Loading initial alert history…</p>
      )}
    </div>
  );
}
