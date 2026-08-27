// src/components/BotHealthPanel.tsx
// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9

import type { BotStatus, BotStatusValue } from "../types/alert";

interface BotHealthPanelProps {
  bots: BotStatus[];
  variant: "condensed" | "detailed";
  loading?: boolean;
  error?: boolean;
}

interface StatusConfig {
  dotClass: string;
  textClass: string;
  label: string;
}

const STATUS_CONFIG: Record<BotStatusValue, StatusConfig> = {
  active: {
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600",
    label: "Active",
  },
  idle: {
    dotClass: "bg-amber-400",
    textClass: "text-amber-600",
    label: "Idle",
  },
  error: {
    dotClass: "bg-rose-500",
    textClass: "text-rose-600",
    label: "Error",
  },
};

function SkeletonCard() {
  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse space-y-3 shadow-sm"
      aria-label="Loading bot status..."
    >
      <div className="h-4 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
  );
}

interface BotCardProps {
  bot: BotStatus;
  variant: "condensed" | "detailed";
}

function BotCard({ bot, variant }: BotCardProps) {
  const config = STATUS_CONFIG[bot.status];

  return (
    <div
      className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm hover:shadow-md transition-shadow"
      aria-label={`Bot: ${bot.name}, Status: ${config.label}`}
    >
      {/* Bot name */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800 truncate">{bot.name}</p>
        {bot.latencyMs !== undefined && (
          <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            {bot.latencyMs}ms
          </span>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${config.dotClass}`}
          aria-hidden="true"
        />
        <span className={`text-xs font-semibold ${config.textClass}`}>
          {config.label}
        </span>
        {/* Error badge — shown in both variants when status is error */}
        {bot.status === "error" && (
          <span
            className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded"
            role="alert"
            aria-label="Bot error"
          >
            ERR
          </span>
        )}
      </div>

      {/* Detection count */}
      <p className="text-xs text-slate-400">
        Detections:{" "}
        <span className="text-slate-800 font-semibold">{bot.detectionCount}</span>
      </p>

      {/* Detailed-only fields */}
      {variant === "detailed" && (
        <>
          {/* Last active timestamp */}
          <p className="text-xs text-slate-400">
            Last active:{" "}
            <span className="text-slate-600 font-mono">
              {bot.lastActive}
            </span>
          </p>

          {/* Enriched telemetry hardware stats */}
          {(bot.cpuPercent !== undefined || bot.accuracyScore !== undefined) && (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
              {bot.cpuPercent !== undefined && (
                <div>
                  <span className="text-slate-400 text-[10px]">CPU / MEM:</span>
                  <p className="text-slate-700 font-medium">{bot.cpuPercent}% / {bot.memoryMb}MB</p>
                </div>
              )}
              {bot.accuracyScore !== undefined && (
                <div>
                  <span className="text-slate-400 text-[10px]">ACCURACY:</span>
                  <p className="text-emerald-600 font-bold">{(bot.accuracyScore * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          )}

          {/* Error message (only when status is error and message is present) */}
          {bot.status === "error" && bot.errorMessage && (
            <p
              className="text-xs text-rose-600 break-words font-medium"
              role="alert"
              aria-label={`Error message: ${bot.errorMessage}`}
            >
              {bot.errorMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function BotHealthPanel({
  bots,
  variant,
  loading = false,
  error = false,
}: BotHealthPanelProps) {
  // Loading state — show skeleton cards
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-busy="true"
        aria-label="Loading bot health data"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Error state — do NOT render partial bot cards
  if (error) {
    return (
      <div
        className="flex items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm"
        role="alert"
        aria-label="Bot health data unavailable"
      >
        <p className="text-rose-500 text-sm font-semibold">
          ⚠️ Bot data could not be loaded
        </p>
      </div>
    );
  }

  // Empty state
  if (bots.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm"
        aria-label="No bot data available"
      >
        <p className="text-slate-400 text-sm">No bot data available</p>
      </div>
    );
  }

  // Normal state — render grid of bot cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bots.map((bot) => (
        <BotCard key={bot.id} bot={bot} variant={variant} />
      ))}
    </div>
  );
}

export default BotHealthPanel;
