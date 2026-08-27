// src/components/ThroughputChart.tsx
// Requirements: 4.1, 4.4, 4.5, 4.6

import { useState } from "react";
import {
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Info } from "lucide-react";
import type { ThroughputPoint } from "../types/alert";
import { formatTimestamp } from "../utils/throughputUtils";

interface ThroughputChartProps {
  dataPoints: ThroughputPoint[];
  unit?: string;
}

function CustomTrendTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const value = payload[0].value;
  return (
    <div className="bg-slate-900/95 backdrop-blur text-white text-xs font-mono px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-2">
      <span className="text-slate-400 text-[10px]">{formatTimestamp(label)}</span>
      <span className="font-bold text-blue-400">{value}</span>
    </div>
  );
}

export function ThroughputChart({ dataPoints, unit = "Mbps" }: ThroughputChartProps) {
  const [timeRange, setTimeRange] = useState("Live Stream");

  // If dataPoints is empty, show empty state message (Req 4.6)
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div
        className="flex h-56 w-full items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400"
        role="status"
        aria-label="Throughput chart empty state"
      >
        No throughput data currently available
      </div>
    );
  }

  const xAxisInterval = Math.max(1, Math.floor(dataPoints.length / 7));

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Threat Trend</h2>
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
        </div>

        {/* Time Range Dropdown */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 pl-3 pr-7 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Live Stream">Live Stream</option>
            <option value="1 Hour">1 Hour</option>
            <option value="24 Hours">24 Hours</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
            ▾
          </div>
        </div>
      </div>

      {/* Area Chart with Gradient Fill */}
      <div className="w-full flex-1 min-h-[190px]">
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart
            data={dataPoints}
            margin={{ top: 12, right: 12, bottom: 4, left: -16 }}
          >
            <defs>
              <linearGradient id="threatTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                <stop offset="85%" stopColor="#60a5fa" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#f1f5f9' }}
              interval={xAxisInterval}
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
              label={{
                value: unit,
                angle: -90,
                position: "insideLeft",
                offset: 20,
                style: { fill: "#94a3b8", fontSize: 10 },
              }}
            />

            <Tooltip content={<CustomTrendTooltip />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#threatTrendGradient)"
              activeDot={{
                r: 4.5,
                fill: "#3b82f6",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ThroughputChart;
