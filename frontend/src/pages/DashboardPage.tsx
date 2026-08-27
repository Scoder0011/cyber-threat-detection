// src/pages/DashboardPage.tsx
// Requirements: 2.1–2.8, 3.1–3.7, 4.1–4.7, 5.1–5.9

import { useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  AlertCircle,
  ShieldCheck,
  Laptop,
} from "lucide-react";
import { useAlerts } from "../hooks/useAlerts";
import { useThroughput } from "../hooks/useThroughput";
import { useBotStatus } from "../hooks/useBotStatus";
import useSearch from "../hooks/useSearch";
import {
  computeTotalAlerts,
  computeCriticalAlerts,
} from "../utils/kpiUtils";
import { KPICard } from "../components/KPICard";
import { GlobalThreatMap } from "../components/GlobalThreatMap";
import { LiveThreatsFeed } from "../components/LiveThreatsFeed";
import { ThreatClassChart } from "../components/ThreatClassChart";
import { ThroughputChart } from "../components/ThroughputChart";
import { SecurityInsightCard } from "../components/SecurityInsightCard";
import { AlertsTable } from "../components/AlertsTable";

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
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

  // ── Dynamic calculations from live data (No Demo Fallbacks) ────────────────
  const securityScore = useMemo(() => {
    if (alerts.length === 0) return 100;
    const critical = alerts.filter((a) => a.severity === "Critical").length;
    const high = alerts.filter((a) => a.severity === "High").length;
    const medium = alerts.filter((a) => a.severity === "Medium").length;
    return Math.max(0, Math.min(100, Math.round(100 - (critical * 12 + high * 6 + medium * 2))));
  }, [alerts]);

  const totalDetections = useMemo(() => {
    const fromBots = bots.reduce((acc, b) => acc + (b.detectionCount || 0), 0);
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    return fromBots + resolved;
  }, [bots, alerts]);

  const vulnerableAssetsCount = useMemo(() => {
    if (alerts.length === 0) return 0;
    return new Set(alerts.map((a) => `${a.destinationIp}${a.targetPort ? `:${a.targetPort}` : ""}`)).size;
  }, [alerts]);

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* ── 1. Top KPI Row (5 Dynamic Cards) ── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {/* Card 1: Dynamic Security Score */}
        <KPICard
          label="Security Score"
          value={securityScore}
          scoreOutOf="/100"
          isGradientScore={true}
          loading={alertsLoading}
        />

        {/* Card 2: Active Threats */}
        <KPICard
          label="Active Threats"
          value={totalAlerts}
          loading={alertsLoading}
          error={alertsError !== null}
          icon={<ShieldAlert className="w-4 h-4 text-slate-700" />}
          delta={
            totalAlerts > 0
              ? { value: `${totalAlerts}`, trend: "up", isPositive: false }
              : { value: "0", trend: "down", isPositive: true }
          }
        />

        {/* Card 3: Critical Incidents */}
        <KPICard
          label="Critical Incidents"
          value={criticalAlerts}
          loading={alertsLoading}
          error={alertsError !== null}
          icon={<AlertCircle className="w-4 h-4 text-slate-700" />}
          delta={
            criticalAlerts > 0
              ? { value: `${criticalAlerts}`, trend: "up", isPositive: false }
              : { value: "0", trend: "down", isPositive: true }
          }
        />

        {/* Card 4: Threats Blocked */}
        <KPICard
          label="Threats Blocked"
          value={totalDetections.toLocaleString()}
          loading={botsLoading}
          error={botsError !== null}
          icon={<ShieldCheck className="w-4 h-4 text-slate-700" />}
          delta={{ value: `${bots.filter((b) => b.status === "active").length} active bots`, trend: "up", isPositive: true }}
        />

        {/* Card 5: Vulnerable Assets */}
        <KPICard
          label="Vulnerable Assets"
          value={vulnerableAssetsCount}
          loading={throughputLoading}
          error={throughputError !== null}
          icon={<Laptop className="w-4 h-4 text-slate-700" />}
          delta={{ value: `${vulnerableAssetsCount} endpoints`, trend: "up", isPositive: vulnerableAssetsCount === 0 }}
        />
      </motion.div>

      {/* ── 2. Middle Row: Global Threat Activity Map + Live Threats Feed ── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Left (8 Cols): Global Threat Map */}
        <div className="lg:col-span-8 flex flex-col">
          <GlobalThreatMap alerts={alerts} />
        </div>

        {/* Right (4 Cols): Live Threats Feed */}
        <div className="lg:col-span-4 flex flex-col">
          <LiveThreatsFeed
            alerts={filteredAlerts}
            onSelectAlert={(id) => navigate("/alerts/" + id)}
          />
        </div>
      </motion.div>

      {/* ── 3. Bottom Row: Threat Trend + Distribution Donut + Security Insight ── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
      >
        {/* Left: Threat Trend Area Chart */}
        <div className="flex flex-col">
          <ThroughputChart
            dataPoints={throughputPoints}
            unit={throughputUnit}
          />
        </div>

        {/* Center: Threat Distribution Donut */}
        <div className="flex flex-col">
          <ThreatClassChart
            alerts={filteredAlerts}
            loading={alertsLoading}
            error={alertsError !== null}
          />
        </div>

        {/* Right: Security Insight & Recommended Actions */}
        <div className="flex flex-col">
          <SecurityInsightCard alerts={alerts} />
        </div>
      </motion.div>

      {/* ── 4. Detailed Forensic Alerts Stream & Table ── */}
      <motion.div variants={fadeUp} id="threat-feed" className="threatlens-card overflow-hidden">
        <AlertsTable
          alerts={filteredAlerts}
          loading={alertsLoading}
          error={alertsError !== null}
          onRowClick={(id) => navigate("/alerts/" + id)}
        />
      </motion.div>
    </motion.div>
  );
}

export default DashboardPage;
