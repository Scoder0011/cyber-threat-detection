import React from "react";
import { Laptop, ShieldCheck, ShieldAlert, Wifi, Activity, Terminal } from "lucide-react";
import { Button } from "../common/Button";

// TODO: replace with API call: GET /api/v1/soc/endpoints
const mockEndpoints = [
  {
    hostname: "SERVER-01 (Frankfurt Core)",
    ip: "10.0.1.45",
    os: "Ubuntu Linux 24.04 LTS",
    status: "Isolated",
    edrStatus: "Active",
    lastHeartbeat: "4 sec ago",
    user: "root / system",
  },
  {
    hostname: "HR-LAPTOP-12",
    ip: "192.168.4.112",
    os: "Windows 11 Enterprise",
    status: "Protected",
    edrStatus: "Active",
    lastHeartbeat: "12 sec ago",
    user: "sarah.miller",
  },
  {
    hostname: "VPN-GATEWAY-ZURICH",
    ip: "185.220.101.5",
    os: "Hardened Alpine OS",
    status: "Protected",
    edrStatus: "Active",
    lastHeartbeat: "1 sec ago",
    user: "vpn-daemon",
  },
  {
    hostname: "PROD-DB-CLUSTER-01",
    ip: "10.200.4.88",
    os: "RedHat Enterprise Linux 9",
    status: "Protected",
    edrStatus: "Active",
    lastHeartbeat: "8 sec ago",
    user: "postgres",
  }
];

export const EndpointsView = ({ onBackToOverview }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1A1E27] p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60 shadow-xs">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E6EB]">
              Endpoint Fleet & EDR Telemetry (4,892 Agents Online)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time process telemetry, kernel hook monitors, and host isolation controls.
            </p>
          </div>
        </div>
        <button
          onClick={onBackToOverview}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold self-start sm:self-center transition-colors"
        >
          ← Return to Overview
        </button>
      </div>

      <div className="bg-white dark:bg-[#1A1E27] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden transition-colors duration-300">
        {mockEndpoints.map((ep) => (
          <div key={ep.hostname} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="flex items-center gap-3.5">
              <div
                className={`p-2 rounded-xl ${
                  ep.status === "Isolated"
                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {ep.status === "Isolated" ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#E4E6EB]">{ep.hostname}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ep.status === "Isolated"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                    }`}
                  >
                    {ep.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                  <span>{ep.ip}</span>
                  <span>•</span>
                  <span>{ep.os}</span>
                  <span>•</span>
                  <span>User: {ep.user}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                Heartbeat: {ep.lastHeartbeat}
              </span>
              <Button
                variant="secondary"
                size="sm"
                tooltip="Open live secure EDR shell"
                icon={<Terminal className="w-3.5 h-3.5" />}
                onClick={() => new Promise((r) => setTimeout(r, 900))}
              >
                Live Terminal
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
