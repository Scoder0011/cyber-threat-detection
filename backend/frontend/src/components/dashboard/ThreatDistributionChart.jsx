import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { ChartSkeleton } from "../common/SkeletonLoader";
import { useTheme } from "../../context/ThemeContext";

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-800 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-bold">{data.name}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold font-mono text-white tabular-nums">
            {data.value.toLocaleString()}
          </span>
          <span className="text-slate-400">({data.percentage}%)</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 max-w-[170px] leading-tight">
          {data.description}
        </p>
      </div>
    );
  }
  return null;
};

export const ThreatDistributionChart = ({ isLoading, data = [], total = 0 }) => {
  const { isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-[#1A1E27] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 p-5 flex flex-col justify-between h-full min-h-[380px]">
      
      {/* CARD HEADER */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 shadow-xs">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#E4E6EB] leading-none">
              Threat Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Categorical breakdown of intercepted vectors
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-slate-400 font-mono">
          30-DAY WINDOW
        </span>
      </div>

      {/* DONUT CHART WITH CENTERED TOTAL (18,472) */}
      <div className="relative w-full h-44 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomPieTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              animationBegin={200}
              animationDuration={1000}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              stroke={isDark ? "#1A1E27" : "#FFFFFF"}
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  className="transition-opacity duration-200 cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900 dark:text-[#E4E6EB] tracking-tight font-sans tabular-nums drop-shadow-sm">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Total Threats
          </span>
        </div>
      </div>

      {/* LEGEND GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {data.map((item, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <div
              key={item.name}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer flex flex-col ${
                isSelected
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-baseline justify-between pl-4 text-xs font-mono">
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.percentage}%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
