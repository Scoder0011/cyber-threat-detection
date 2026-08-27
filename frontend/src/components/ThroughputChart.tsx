// src/components/ThroughputChart.tsx
// Requirements: 4.1, 4.4, 4.5, 4.6

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ThroughputPoint } from "../types/alert";
import { formatTimestamp } from "../utils/throughputUtils";

// ── Props ─────────────────────────────────────────────────────────────────

interface ThroughputChartProps {
  dataPoints: ThroughputPoint[];
  unit?: string;
}

// ── Component ─────────────────────────────────────────────────────────────

/**
 * ThroughputChart renders a real-time line chart of network throughput
 * data points over a rolling 60-point window. Displays an empty state
 * message when no data is available.
 *
 * Requirements 4.1, 4.4, 4.5, 4.6
 */
export function ThroughputChart({ dataPoints, unit = "Mbps" }: ThroughputChartProps) {
  // ── Empty state (Req 4.6) ────────────────────────────────────────────

  if (dataPoints.length === 0) {
    return (
      <div
        className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-900 text-gray-400"
        role="status"
        aria-label="Throughput chart empty state"
      >
        No throughput data currently available
      </div>
    );
  }

  // X-axis tick interval — show at most ~6 ticks (Req 4.4)
  const xAxisInterval = Math.max(1, Math.floor(dataPoints.length / 6));

  // ── Chart ────────────────────────────────────────────────────────────

  return (
    <div className="w-full rounded-lg bg-gray-900 p-4">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={dataPoints}
          margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
        >
          {/* Dark-theme grid lines (Req 4.1) */}
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

          {/*
           * X-axis: ISO timestamps formatted as HH:mm:ss via formatTimestamp (Req 4.4)
           * interval ensures ticks are spaced at intervals ≤ 10 points.
           */}
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            stroke="#6b7280"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            interval={xAxisInterval}
          />

          {/*
           * Y-axis: numeric values with unit label (Req 4.5)
           */}
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            width={60}
            label={{
              value: unit,
              angle: -90,
              position: "insideLeft",
              offset: -4,
              style: { fill: "#9ca3af", fontSize: 11 },
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: 6,
              color: "#f9fafb",
              fontSize: 12,
            }}
            labelFormatter={(label: string) => formatTimestamp(label)}
            formatter={(value: number) => [`${value} ${unit}`, "Throughput"]}
          />

          {/* Cyan accent line — no dots for a clean real-time look (Req 4.1) */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#22d3ee" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ThroughputChart;
