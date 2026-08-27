// src/pages/SystemHealthPage.tsx
// Requirements: 10.1–10.6

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import apiClient from "../api/apiClient";
import { useBotStatus } from "../hooks/useBotStatus";
import { useThroughput } from "../hooks/useThroughput";
import { BotHealthPanel } from "../components/BotHealthPanel";
import { ThroughputChart } from "../components/ThroughputChart";
import type { SystemMetrics } from "../types/alert";

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000;

// ── Metric card ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  highlight?: boolean;
}

function MetricCard({ label, value, unit, highlight = false }: MetricCardProps) {
  const borderClass = highlight
    ? "border-amber-400 bg-amber-900/20"
    : "border-gray-700";

  const hasValue = value !== null && value !== undefined;

  return (
    <div
      className={`rounded-xl border p-5 bg-gray-900 transition-colors duration-300 ${borderClass}`}
      aria-label={`${label}: ${hasValue ? `${value} ${unit}` : "No data"}`}
    >
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      {hasValue ? (
        <p className="text-2xl font-bold text-white font-mono">
          {value}
          <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
        </p>
      ) : (
        <p className="text-lg text-gray-500 italic">No data</p>
      )}
    </div>
  );
}

// ── Page entrance animation variants ─────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// ── Page component ────────────────────────────────────────────────────────

export function SystemHealthPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  const mountedRef = useRef<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Bots ───────────────────────────────────────────────────────────────
  const { bots, loading: botsLoading, error: botsError } = useBotStatus();

  // ── Throughput ─────────────────────────────────────────────────────────
  const { points: throughputPoints } = useThroughput();

  // ── System metrics polling ─────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    async function fetchMetrics(): Promise<void> {
      try {
        const data = await apiClient.fetchSystemMetrics();
        if (!mountedRef.current) return;
        setMetrics(data);
      } catch {
        if (!mountedRef.current) return;
        // On error set metrics to null so cards show "No data"
        setMetrics(null);
      }
    }

    void fetchMetrics();
    intervalRef.current = setInterval(() => void fetchMetrics(), POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ── Amber highlight logic (Req 10.4, 10.5) ────────────────────────────
  const cpuHighlight = metrics !== null && metrics !== undefined && metrics.cpuUsage > 80;
  const memHighlight = metrics !== null && metrics !== undefined && metrics.memoryUsage > 85;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="p-6 space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page title */}
      <h1 className="text-xl font-semibold text-white">System Health</h1>

      {/* System metric cards */}
      <section aria-label="System metrics">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
          System Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="CPU Usage"
            value={metrics?.cpuUsage ?? null}
            unit="%"
            highlight={cpuHighlight}
          />
          <MetricCard
            label="Memory Usage"
            value={metrics?.memoryUsage ?? null}
            unit="%"
            highlight={memHighlight}
          />
          <MetricCard
            label="Network I/O"
            value={metrics?.networkIo ?? null}
            unit="Mbps"
          />
          <MetricCard
            label="Pipeline Latency"
            value={metrics?.pipelineLatency ?? null}
            unit="ms"
          />
        </div>
      </section>

      {/* Bot health panel — detailed variant */}
      <section aria-label="Bot health">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
          Bot Health
        </h2>
        <BotHealthPanel
          bots={bots}
          variant="detailed"
          loading={botsLoading}
          error={!!botsError}
        />
      </section>

      {/* Throughput chart */}
      <section aria-label="Throughput">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
          Network Throughput
        </h2>
        <ThroughputChart dataPoints={throughputPoints} />
      </section>
    </motion.div>
  );
}

export default SystemHealthPage;
