import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";
import { ChartSkeleton } from "../common/SkeletonLoader";
import { useTheme } from "../../context/ThemeContext";
import { Tooltip as UITooltip } from "../common/Tooltip";

// Custom Tooltip per requirement: "hover tooltip showing time + value (e.g. 11:42 — 609)"
const CustomThreatTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-slate-950/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-800 text-xs backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-slate-800">
          <span className="font-mono text-slate-400">{dataPoint.time}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            TELEMETRY
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-blue-400 tabular-nums">
            {dataPoint.threats}
          </span>
          <span className="text-slate-400 text-[11px]">total threats</span>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] text-slate-400 gap-3 font-mono">
          <span>Auto-Blocked: <strong className="text-emerald-400">{dataPoint.blocked}</strong></span>
          <span>Escalated: <strong className="text-rose-400">{dataPoint.incidents}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

const timeframes = [{ value: "24h", label: "24 Hours" }];

export const ThreatTrendChart = ({ isLoading, data = [] }) => {
  const { isDark } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState("24 Hours");
  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-[#1A1E27] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 p-5 flex flex-col justify-between h-full min-h-[380px]">
      
      {/* CARD HEADER */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60 shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#E4E6EB] leading-none">
              Threat Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hourly volume analysis across ingress points
            </p>
          </div>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <UITooltip content="Filter telemetry window" position="bottom">
            <button
              id="threat-trend-timeframe-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="Select timeframe"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
            >
              <span>{selectedTimeframe}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </UITooltip>

          {showDropdown && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#1A1E27] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 backdrop-blur-xl">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => {
                    setSelectedTimeframe(tf.label);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    selectedTimeframe === tf.label
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECHARTS AREA CHART */}
      <div className="w-full h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="threatsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={isDark ? 0.6 : 0.45} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#242D3D" : "#F1F5F9"}
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: isDark ? "#2A364B" : "#E2E8F0" }}
              tick={{ fill: isDark ? "#64748B" : "#94A3B8", fontSize: 11, fontFamily: "Inter" }}
              interval="preserveStartEnd"
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: isDark ? "#2A364B" : "#E2E8F0" }}
              tick={{ fill: isDark ? "#64748B" : "#94A3B8", fontSize: 11, fontFamily: "Inter" }}
            />

            <Tooltip
              content={<CustomThreatTooltip />}
              cursor={{ stroke: "#3B82F6", strokeWidth: 1.5, strokeDasharray: "4 4" }}
            />

            <Area
              type="monotone"
              dataKey="threats"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#threatsAreaGradient)"
              activeDot={{
                r: 6,
                fill: "#3B82F6",
                stroke: isDark ? "#1A1E27" : "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER METRIC HIGHLIGHT */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-glow-blue" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Threat Ingress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-green" />
            <span className="text-slate-600 dark:text-slate-300">Mitigated (95.4%)</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Peak: <strong className="text-slate-700 dark:text-slate-200">710 @ 14:00</strong>
        </div>
      </div>
    </div>
  );
};
