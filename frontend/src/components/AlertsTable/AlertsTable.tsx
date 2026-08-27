import { useState } from "react";
import { Link } from "react-router-dom";
import type { Alert, Severity } from "@/types/alert";
import { SeverityBadge } from "@/components/SeverityBadge/SeverityBadge";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

export function AlertsTable({ alerts }: { alerts: Alert[] }) {
  const [filter, setFilter] = useState<Severity | "all">("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="flex flex-col rounded-lg border border-hairline bg-panel">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <h2 className="font-display text-sm font-semibold tracking-wide text-ink">
          Fused Alerts
        </h2>
        <div className="flex gap-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {SEVERITY_ORDER.map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {s}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="max-h-[520px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-panel">
            <tr className="text-xs uppercase tracking-wider text-dim">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Severity</th>
              <th className="px-4 py-2 font-medium">Threat class</th>
              <th className="px-4 py-2 font-medium">Source → Dest</th>
              <th className="px-4 py-2 font-medium">Fused score</th>
              <th className="px-4 py-2 font-medium">Chain</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-t border-hairline/60 transition-colors hover:bg-panel2"
              >
                <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-dim">
                  {new Date(a.created_at).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2">
                  <SeverityBadge severity={a.severity} />
                </td>
                <td className="px-4 py-2 font-mono text-xs text-ink">
                  {a.threat_classes.join(", ")}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-dim">
                  {a.src_ip} → {a.dst_ip}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-flow">
                  {(a.fused_score * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2 font-mono text-xs">
                  {a.chain_verified ? (
                    <span className="text-signal-low">verified</span>
                  ) : (
                    <span className="text-dim">pending</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    to={`/alerts/${a.id}`}
                    className="text-xs text-flow underline-offset-2 hover:underline"
                  >
                    Inspect
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-mono text-xs text-dim">
                  No alerts match this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 font-mono text-[11px] capitalize transition-colors ${
        active
          ? "border-flow bg-flow/10 text-flow"
          : "border-hairline text-dim hover:border-dim hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}