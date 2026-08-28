import React, { useState } from "react";
import { ServerCrash, Shield, Search, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../common/Button";

// TODO: replace with API call: GET /api/v1/soc/vulnerabilities
const mockVulns = [
  {
    cve: "CVE-2026-3841",
    name: "OpenSSL Remote Memory Disclosure in Edge Proxy",
    severity: "Critical",
    cvss: 9.8,
    affectedAssets: 48,
    patchAvailable: true,
    category: "Remote Code Execution",
  },
  {
    cve: "CVE-2026-2194",
    name: "Linux Kernel Privilege Escalation in eBPF Subsystem",
    severity: "High",
    cvss: 8.4,
    affectedAssets: 112,
    patchAvailable: true,
    category: "Privilege Escalation",
  },
  {
    cve: "CVE-2026-1082",
    name: "Cisco AnyConnect VPN Gateway Buffer Overflow",
    severity: "Critical",
    cvss: 9.6,
    affectedAssets: 6,
    patchAvailable: true,
    category: "Authentication Bypass",
  },
  {
    cve: "CVE-2026-0922",
    name: "Apache Log4j JNDI Lookup Vulnerability (Variant 4)",
    severity: "Medium",
    cvss: 6.5,
    affectedAssets: 89,
    patchAvailable: false,
    category: "Information Disclosure",
  }
];

export const VulnerabilitiesView = ({ onBackToOverview }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1A1E27] p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 shadow-xs">
            <ServerCrash className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E6EB]">
              Vulnerability Management (255 Vulnerable Assets Detected)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous CVE telemetry across cloud workloads, endpoints, and perimeter firewalls.
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
        {mockVulns.map((vuln) => (
          <div key={vuln.cve} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800/60">
                  {vuln.cve}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">CVSS {vuln.cvss}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  {vuln.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#E4E6EB]">{vuln.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Impacts {vuln.affectedAssets} endpoints across EMEA & US East
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                Patch Ready
              </span>
              <Button
                variant="primary"
                size="sm"
                tooltip={`Deploy automated patch for ${vuln.cve}`}
                onClick={() => new Promise((r) => setTimeout(r, 1000))}
              >
                Deploy Patch
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
