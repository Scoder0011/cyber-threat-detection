// src/pages/DashboardPage.tsx
// Requirements: 2.1–2.8, 3.1–3.7, 4.1–4.7, 5.1–5.9

import { useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import { useAlerts } from "../hooks/useAlerts";
import { useThroughput } from "../hooks/useThroughput";
import { useBotStatus } from "../hooks/useBotStatus";
import useSearch from "../hooks/useSearch";
import {
  computeTotalAlerts,
  computeCriticalAlerts,
  computeActiveBots,
  computeCurrentThroughput,
} from "../utils/kpiUtils";
import { KPICard } from "../components/KPICard";
import { ThreatClassChart } from "../components/ThreatClassChart";
import { ThroughputChart } from "../components/ThroughputChart";
import { BotHealthPanel } from "../components/BotHealthPanel";
import { AlertsTable } from "../components/AlertsTable";

const ThreatGlobe = lazy(() => import("../components/ThreatGlobe"));

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const { alerts, loading: alertsLoading, error: alertsError } = useAlerts();
  const { points: throughputPoints, loading: throughputLoading, error: throughputError } = useThroughput();
  const { bots, loading: botsLoading, error: botsError } = useBotStatus();
  const { filteredAlerts } = useSearch(alerts, searchQuery);

  const throughputUnit = throughputPoints[throughputPoints.length - 1]?.unit ?? "Mbps";
  const totalAlerts = computeTotalAlerts(alerts);
  const criticalAlerts = computeCriticalAlerts(alerts);
  const activeBots = computeActiveBots(bots);
  const currentThroughput = computeCurrentThroughput(throughputPoints);

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="p-6 space-y-6 min-h-full"
    >
      {/* ── Hero section: Globe + KPIs ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Globe */}
        <div className="glass rounded-3xl overflow-hidden relative" style={{ height: "420px" }}>
          {/* Header overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 p-5 flex items-center justify-between pointer-events-none">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Global Threat Map</h1>
              <p className="text-xs text-white/40 mt-0.5">Real-time IP traffic intelligence</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white/50 font-medium">LIVE</span>
            </div>
          </div>
          {/* Globe canvas */}
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            </div>
          }>
            <ThreatGlobe alerts={alerts} />
          </Suspense>
          {/* Bottom gradient overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(2,8,23,0.8), transparent)" }}
          />
        </div>

        {/* KPI Cards stacked on the right */}
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 content-start">
          <KPICard
            label="Total Alerts"
            value={totalAlerts}
            loading={alertsLoading}
            error={alertsError !== null}
            icon="🔴"
            accent="text-white"
          />
          <KPICard
            label="Critical"
            value={criticalAlerts}
            loading={alertsLoading}
            error={alertsError !== null}
            icon="⚠️"
            accent="text-red-400"
          />
          <KPICard
            label="Active Bots"
            value={activeBots}
            loading={botsLoading}
            error={botsError !== null}
            icon="🤖"
            accent="text-emerald-400"
          />
          <KPICard
            label="Throughput"
            value={`${currentThroughput} ${throughputUnit}`}
            loading={throughputLoading}
            error={throughputError !== null}
            icon="📡"
            accent="text-cyan-400"
          />
        </div>
      </motion.div>

      {/* ── Charts ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            Threat Distribution
          </h2>
          <ThreatClassChart alerts={filteredAlerts} loading={alertsLoading} error={alertsError !== null} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
            Network Throughput
          </h2>
          <ThroughputChart dataPoints={throughputPoints} unit={throughputUnit} />
        </div>
      </motion.div>

      {/* ── Bot Health ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
          Bot Network
        </h2>
        <BotHealthPanel bots={bots} variant="condensed" loading={botsLoading} error={botsError !== null} />
      </motion.div>

      {/* ── Alerts Table ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
          Recent Alerts
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          <AlertsTable
            alerts={filteredAlerts}
            loading={alertsLoading}
            error={alertsError !== null}
            onRowClick={(id) => navigate("/alerts/" + id)}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DashboardPage;
