// src/components/ThreatClassChart.tsx
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Info } from "lucide-react";
import type { Alert } from "../types/alert";
import {
  groupAlertsByType,
  getThreatClassColors,
} from "../utils/threatClassUtils";

interface ThreatClassChartProps {
  alerts: Alert[];
  loading?: boolean;
  error?: boolean;
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  return (
    <div className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg border border-slate-700">
      <span className="font-semibold text-slate-200">{entry.name}</span>: {Number(entry.value).toLocaleString()}
    </div>
  );
}

export function ThreatClassChart({
  alerts,
  loading = false,
  error = false,
}: ThreatClassChartProps) {
  // --- Error state (req 3.7): show message, no chart ---
  if (error) {
    return (
      <div
        className="flex h-full min-h-[240px] items-center justify-center rounded-2xl bg-white p-6 text-center border border-slate-200"
        role="alert"
      >
        <p className="text-sm text-rose-500 font-medium">
          Threat data could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl bg-white p-6 border border-slate-200">
        <div className="h-32 w-32 animate-pulse rounded-full bg-slate-100" />
      </div>
    );
  }

  // Derive grouped data — omits zero-count categories (req 3.5)
  const data = groupAlertsByType(alerts);

  // --- Empty / no-data state (req 3.5, 3.7) ---
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl bg-white p-6 text-center border border-slate-200">
        <p className="text-sm text-slate-400 font-medium">No threat data available</p>
      </div>
    );
  }

  const categoryNames = data.map((d) => d.name);
  const colors = getThreatClassColors(categoryNames);
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Threat Distribution</h2>
        <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-1">
        {/* Donut Chart with Center Total */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={3}
                cornerRadius={4}
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={colors[index % colors.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-base font-extrabold text-slate-900 leading-tight">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-400">Total</span>
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div className="space-y-1.5 flex-1 w-full text-xs max-h-[160px] overflow-y-auto">
          {data.map((item, idx) => {
            const pct = Math.round((item.count / (totalCount || 1)) * 100);
            return (
              <div key={item.name} className="flex items-center justify-between gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="truncate text-slate-700 font-medium text-[11px]">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <span className="text-slate-400 text-[11px] w-7 text-right">{pct}%</span>
                  <span className="font-bold text-slate-800 text-[11px] w-12 text-right">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ThreatClassChart;
