import type { ConnectionStatus } from "../types/alert";

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus; // "connected" | "reconnecting" | "disconnected" | "replay"
}

interface StatusConfig {
  label: string;
  dotClass: string;
  textClass: string;
}

const STATUS_CONFIG: Record<ConnectionStatus, StatusConfig> = {
  connected: {
    label: "Connected",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-400",
  },
  reconnecting: {
    label: "Reconnecting",
    dotClass: "bg-amber-400",
    textClass: "text-amber-400",
  },
  disconnected: {
    label: "Disconnected",
    dotClass: "bg-red-500",
    textClass: "text-red-500",
  },
  replay: {
    label: "Replay",
    dotClass: "bg-cyan-400",
    textClass: "text-[#22d3ee]",
  },
};

export default function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700"
      aria-label={`Connection status: ${config.label}`}
      role="status"
    >
      {/* Colored dot indicator */}
      <span
        className={`inline-block w-2 h-2 rounded-full ${config.dotClass} ${
          status === "reconnecting" ? "animate-pulse" : ""
        }`}
        aria-hidden="true"
      />
      {/* Status label text */}
      <span className={`text-xs font-medium ${config.textClass}`}>
        {config.label}
      </span>
    </div>
  );
}

