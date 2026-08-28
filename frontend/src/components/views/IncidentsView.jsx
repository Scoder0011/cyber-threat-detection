import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from "lucide-react";

// TODO: replace with API call: GET /api/v1/soc/incidents
const mockIncidentsList = [
  {
    id: "INC-2026-0519",
    title: "Coordinated LockBit 3.0 Ransomware Activity on Internal SAN",
    severity: "Critical",
    status: "Investigating",
    assignee: "Alex Morgan",
    affectedHosts: ["SERVER-01 (DE-FRA)", "SAN-STORAGE-04"],
    detectedTime: "8 min ago",
    mitreTactic: "Impact (T1486)",
    score: 9.8,
  },
  {
    id: "INC-2026-0518",
    title: "Mass Spear-Phishing Campaign Impersonating IT Helpdesk SSO",
    severity: "High",
    status: "Containment",
    assignee: "Sarah Jenkins",
    affectedHosts: ["14 Email Inboxes", "SSO-PROXY-01"],
    detectedTime: "34 min ago",
    mitreTactic: "Initial Access (T1566)",
    score: 8.2,
  },
  {
    id: "INC-2026-0517",
    title: "Anomalous Outbound Data Exfiltration over DNS Tunneling",
    severity: "Critical",
    status: "Triage",
    assignee: "Devon Vance",
    affectedHosts: ["FIN-WORKSTATION-88"],
    detectedTime: "1 hr ago",
    mitreTactic: "Exfiltration (T1048)",
    score: 9.1,
  },
  {
    id: "INC-2026-0516",
    title: "Brute Force SSH Spray Targeting Edge VPN Concentrators",
    severity: "Medium",
    status: "Mitigated",
    assignee: "SOAR Automation",
    affectedHosts: ["VPN-GATEWAY-CH"],
    detectedTime: "2 hrs ago",
    mitreTactic: "Credential Access (T1110)",
    score: 6.4,
  },
  {
    id: "INC-2026-0515",
    title: "Unauthorized IAM Role Escalation in AWS Production Account",
    severity: "High",
    status: "Resolved",
    assignee: "Cloud Sec Team",
    affectedHosts: ["arn:aws:iam::8849:role/DevSecAdmin"],
    detectedTime: "4 hrs ago",
    mitreTactic: "Privilege Escalation (T1078)",
    score: 8.7,
  }
];

export const IncidentsView = ({ onBackToOverview }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = mockIncidentsList.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "All" || inc.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1A1E27] p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E6EB]">
              Active Security Incidents (12 Total, 5 High Severity)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Correlated threat investigations requiring SOC tier-2/3 intervention.
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

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1A1E27] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark transition-colors duration-300">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID, hostname, tactic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["All", "Investigating", "Containment", "Mitigated", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white dark:bg-[#1A1E27] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark overflow-hidden transition-colors duration-300">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {filtered.map((inc) => (
            <div
              key={inc.id}
              className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={`mt-0.5 px-2 py-1 rounded-lg text-[11px] font-bold ${
                    inc.severity === "Critical"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                      : inc.severity === "High"
                      ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                  }`}
                >
                  {inc.severity}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {inc.id}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-mono text-slate-400">
                      CVSS {inc.score}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#E4E6EB] mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {inc.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                    <span>{inc.mitreTactic}</span>
                    <span>•</span>
                    <span>Target: {inc.affectedHosts.join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pl-12 md:pl-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    {inc.assignee}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {inc.detectedTime}
                  </span>
                </div>

                <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
