// src/components/KPICard.tsx
import { motion } from "framer-motion";

interface KPICardProps {
  label: string;
  value: number | string;
  loading?: boolean;
  error?: boolean;
  lastValue?: number | string;
  icon?: string;
  accent?: string; // tailwind text color class e.g. "text-cyan-400"
}

export function KPICard({
  label, value, loading = false, error = false, lastValue, icon, accent = "text-cyan-400"
}: KPICardProps) {
  const displayValue = error ? (lastValue ?? 0) : value;

  return (
    <motion.div
      className="glass rounded-2xl p-5 relative overflow-hidden"
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Ambient glow orb */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${
        error ? "bg-red-500" : "bg-cyan-400"
      }`} />

      {loading ? (
        <div className="animate-pulse space-y-3" aria-label="Loading...">
          <div className="h-3 bg-white/10 rounded w-3/4" />
          <div className="h-8 bg-white/10 rounded w-1/2" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-white/50 uppercase tracking-widest">{label}</p>
            {icon && <span className="text-lg opacity-70">{icon}</span>}
          </div>
          <motion.p
            key={String(displayValue)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-3xl font-bold ${accent} text-glow`}
          >
            {displayValue}
          </motion.p>
          {error && (
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1" role="alert" aria-label="Data unavailable, showing last known value">
              <span>⚠</span> Stale data
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

export default KPICard;
