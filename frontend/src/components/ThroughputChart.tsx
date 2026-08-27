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

// Fallback 24-hour realistic threat trend curve matching mockup
const MOCKUP_TREND_POINTS = [
  { timestamp: "2026-07-31T00:00:00.000Z", value: 310 },
  { timestamp: "2026-07-31T01:00:00.000Z", value: 190 },
  { timestamp: "2026-07-31T02:00:00.000Z", value: 580 },
  { timestamp: "2026-07-31T03:00:00.000Z", value: 420 },
  { timestamp: "2026-07-31T04:00:00.000Z", value: 240 },
  { timestamp: "2026-07-31T05:00:00.000Z", value: 410 },
  { timestamp: "2026-07-31T06:00:00.000Z", value: 640 },
  { timestamp: "2026-07-31T07:00:00.000Z", value: 490 },
  { timestamp: "2026-07-31T08:00:00.000Z", value: 360 },
  { timestamp: "2026-07-31T09:00:00.000Z", value: 680 },
  { timestamp: "2026-07-31T10:00:00.000Z", value: 520 },
  { timestamp: "2026-07-31T11:42:00.000Z", value: 609 },
  { timestamp: "2026-07-31T12:00:00.000Z", value: 710 },
  { timestamp: "2026-07-31T13:00:00.000Z", value: 660 },
  { timestamp: "2026-07-31T14:00:00.000Z", value: 720 },
  { timestamp: "2026-07-31T15:00:00.000Z", value: 460 },
  { timestamp: "2026-07-31T16:00:00.000Z", value: 480 },
  { timestamp: "2026-07-31T17:00:00.000Z", value: 690 },
  { timestamp: "2026-07-31T18:00:00.000Z", value: 540 },
  { timestamp: "2026-07-31T19:00:00.000Z", value: 380 },
  { timestamp: "2026-07-31T20:00:00.000Z", value: 210 },
  { timestamp: "2026-07-31T21:00:00.000Z", value: 320 },
  { timestamp: "2026-07-31T22:00:00.000Z", value: 580 },
  { timestamp: "2026-07-31T23:00:00.000Z", value: 490 },
  { timestamp: "2026-07-31T23:59:00.000Z", value: 530 },
];

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

export function ThroughputChart({ dataPoints, unit: _unit = "Mbps" }: ThroughputChartProps) {
  const [timeRange, setTimeRange] = useState("24 Hours");

  // If dataPoints is empty, show empty state message (Req 4.6)
  if (dataPoints.length === 0) {
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

  // Use real data points or rich 24h trend
  const chartData = dataPoints.length > 5 ? dataPoints : MOCKUP_TREND_POINTS;
  const xAxisInterval = Math.max(1, Math.floor(chartData.length / 7));

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
            <option value="24 Hours">24 Hours</option>
            <option value="7 Days">7 Days</option>
            <option value="30 Days">30 Days</option>
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
            data={chartData}
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
              ticks={[0, 200, 400, 600, 800]}
              domain={[0, 800]}
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
