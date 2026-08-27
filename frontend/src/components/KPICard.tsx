// src/components/KPICard.tsx
import React from 'react';
import { motion } from "framer-motion";
import { ArrowUpRight, Gauge } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | string;
  loading?: boolean;
  error?: boolean;
  lastValue?: number | string;
  icon?: React.ReactNode | string;
  accent?: string;
  delta?: {
    value: string;
    trend: 'up' | 'down';
    isPositive?: boolean;
  };
  isGradientScore?: boolean;
  scoreOutOf?: string;
}

export function KPICard({
  label,
  value,
  loading = false,
  error = false,
  lastValue,
  icon,
  accent = "text-slate-900",
  delta,
  isGradientScore = false,
  scoreOutOf = "/100",
}: KPICardProps) {
  const displayValue = error ? (lastValue ?? 0) : value;

  // Gradient Security Score Card Variant (Card 1 in mockup)
  if (isGradientScore) {
    return (
      <motion.div
        className="threatlens-gradient-score text-white rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-md"
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center gap-2 text-white/90 mb-4">
          <Gauge className="w-4 h-4" />
          <p className="text-xs font-semibold tracking-wide">{label}</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2" aria-label="Loading...">
            <div className="h-8 bg-white/20 rounded w-1/2" />
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">{displayValue}</span>
            <span className="text-sm font-medium text-white/75">{scoreOutOf}</span>
          </div>
        )}
      </motion.div>
    );
  }

  // Standard ThreatLens White KPI Card
  return (
    <motion.div
      className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Card Header: Icon + Label + Top-Right Arrow */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-700">
          {icon && typeof icon === 'string' ? (
            <span className="text-sm">{icon}</span>
          ) : (
            icon
          )}
          <p className="text-xs font-semibold text-slate-700 tracking-tight">{label}</p>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2 py-1" aria-label="Loading...">
          <div className="h-7 bg-slate-100 rounded w-1/2" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2 mt-1">
          <motion.p
            key={String(displayValue)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-3xl font-extrabold ${accent} tracking-tight`}
          >
            {displayValue}
          </motion.p>

          {delta && (
            <div className="flex items-center gap-1 text-[11px] pb-1">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  delta.isPositive ?? (delta.trend === 'down')
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {delta.trend === 'up' ? '▴' : '▾'} {delta.value}
              </span>
              <span className="text-slate-400 text-[10px]">vs yesterday</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-rose-500 text-xs mt-1 flex items-center gap-1" role="alert" aria-label="Data unavailable, showing last known value">
          <span>⚠</span> Stale data
        </p>
      )}
    </motion.div>
  );
}

export default KPICard;
