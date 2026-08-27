// src/components/BotHealthPanel.tsx

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
    textClass: "text-emerald-400",
    label: "Active",
  },
  idle: {
    dotClass: "bg-amber-400",
    textClass: "text-amber-400",
    label: "Idle",
  },
  error: {
    dotClass: "bg-red-500",
    textClass: "text-red-400",
    label: "Error",
  },
};

function SkeletonCard() {
  return (
    <div
      className="bg-gray-900 border border-gray-700 rounded-xl p-4 animate-pulse space-y-3"
      aria-label="Loading bot status..."
    >
      <div className="h-4 bg-gray-700 rounded w-2/3" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
      <div className="h-3 bg-gray-700 rounded w-1/3" />
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
      className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2"
      aria-label={`Bot: ${bot.name}, Status: ${config.label}`}
    >
      {/* Bot name */}
      <p className="text-sm font-semibold text-white truncate">{bot.name}</p>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${config.dotClass}`}
          aria-hidden="true"
        />
        <span className={`text-xs font-medium ${config.textClass}`}>
          {config.label}
        </span>
        {/* Error badge â€” shown in both variants when status is error */}
        {bot.status === "error" && (
          <span
            className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-red-900 text-red-300 rounded"
            role="alert"
            aria-label="Bot error"
          >
            ERR
          </span>
        )}
      </div>

      {/* Detection count */}
      <p className="text-xs text-gray-400">
        Detections:{" "}
        <span className="text-white font-medium">{bot.detectionCount}</span>
      </p>

      {/* Detailed-only fields */}
      {variant === "detailed" && (
        <>
          {/* Last active timestamp */}
          <p className="text-xs text-gray-400">
            Last active:{" "}
            <span className="text-gray-300 font-mono">
              {bot.lastActive}
            </span>
          </p>

          {/* Error message (only when status is error and message is present) */}
          {bot.status === "error" && bot.errorMessage && (
            <p
              className="text-xs text-red-400 break-words"
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
  // Loading state â€” show skeleton cards
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

  // Error state â€” do NOT render partial bot cards
  if (error) {
    return (
      <div
        className="flex items-center justify-center p-8 bg-gray-900 border border-gray-700 rounded-xl"
        role="alert"
        aria-label="Bot health data unavailable"
      >
        <p className="text-red-400 text-sm font-medium">
          âš  Bot data could not be loaded
        </p>
      </div>
    );
  }

  // Empty state
  if (bots.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 bg-gray-900 border border-gray-700 rounded-xl"
        aria-label="No bot data available"
      >
        <p className="text-gray-400 text-sm">No bot data available</p>
      </div>
    );
  }

  // Normal state â€” render grid of bot cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bots.map((bot) => (
        <BotCard key={bot.id} bot={bot} variant={variant} />
      ))}
    </div>
  );
}

export default BotHealthPanel;

