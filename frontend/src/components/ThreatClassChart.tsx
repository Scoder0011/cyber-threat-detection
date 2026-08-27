// src/components/ThreatClassChart.tsx
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
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

// ---------------------------------------------------------------------------
// Custom tooltip — shows "CategoryName: count"
// ---------------------------------------------------------------------------
function CustomTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  return (
    <div className="rounded bg-gray-800 px-3 py-2 text-sm text-white shadow-lg">
      <span className="font-semibold">{entry.name}</span>: {entry.value}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ThreatClassChart
// ---------------------------------------------------------------------------
export function ThreatClassChart({
  alerts,
  loading = false,
  error = false,
}: ThreatClassChartProps) {
  // --- Error state (req 3.7): show message, no chart ---
  if (error) {
    return (
      <div
        className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-gray-900 p-6 text-center"
        role="alert"
      >
        <p className="text-sm text-red-400">
          Threat data could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-gray-900 p-6">
        <div className="h-32 w-32 animate-pulse rounded-full bg-gray-700" />
      </div>
    );
  }

  // Derive grouped data — omits zero-count categories (req 3.5)
  const data = groupAlertsByType(alerts);

  // --- Empty / no-data state (req 3.5, 3.7) ---
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-gray-900 p-6 text-center">
        <p className="text-sm text-gray-400">No threat data available</p>
      </div>
    );
  }

  // Derive distinct colors for visible segments (req 3.4)
  const categoryNames = data.map((d) => d.name);
  const colors = getThreatClassColors(categoryNames);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          // Doughnut effect (req 3.1)
          innerRadius="50%"
          outerRadius="80%"
          paddingAngle={2}
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={colors[index]}
              stroke="transparent"
            />
          ))}
        </Pie>

        {/* Tooltip — category name + exact count (req 3.6) */}
        <Tooltip content={<CustomTooltip />} />

        {/* Legend for quick reference */}
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default ThreatClassChart;
