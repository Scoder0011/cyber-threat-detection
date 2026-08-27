import React from 'react';
import { ThreatAlert } from '../types/alert';
import { ShieldAlert, Zap, Radio, Globe, Lock, Search, UploadCloud } from 'lucide-react';

interface ThreatClassChartProps {
  alerts: ThreatAlert[];
}

const VECTOR_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  DDOS_SYN_FLOOD: {
    label: 'DDoS SYN Flood',
    color: 'text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500/30',
    icon: Zap,
  },
  DDOS_UDP_AMPLIFICATION: {
    label: 'UDP Amplification',
    color: 'text-orange-400',
    bg: 'bg-orange-500',
    border: 'border-orange-500/30',
    icon: Zap,
  },
  C2_BEACONING: {
    label: 'C2 Beaconing (Jitter)',
    color: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
    icon: Radio,
  },
  DGA_DOMAIN_LOOKUP: {
    label: 'DGA DNS Algorithm',
    color: 'text-purple-400',
    bg: 'bg-purple-500',
    border: 'border-purple-500/30',
    icon: Globe,
  },
  ENCRYPTED_MALWARE_TLS: {
    label: 'Encrypted Malware (JA3)',
    color: 'text-pink-400',
    bg: 'bg-pink-500',
    border: 'border-pink-500/30',
    icon: Lock,
  },
  PORT_SCAN_VERTICAL: {
    label: 'Port & Subnet Scan',
    color: 'text-blue-400',
    bg: 'bg-blue-500',
    border: 'border-blue-500/30',
    icon: Search,
  },
  DATA_EXFILTRATION: {
    label: 'Data Exfiltration (Tunnel)',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    icon: UploadCloud,
  },
};

export const ThreatClassChart: React.FC<ThreatClassChartProps> = ({ alerts }) => {
  // Aggregate counts per threat category
  const counts: Record<string, number> = {};
  alerts.forEach((a) => {
    counts[a.attack_type] = (counts[a.attack_type] || 0) + 1;
  });

  const total = alerts.length || 1;

  // Render top categories
  const categories = Object.keys(VECTOR_CONFIG);

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          Threat Vector Distribution (6 AI Bots)
        </div>
        <span className="text-xs font-mono text-slate-400">Total: {alerts.length} Incidents</span>
      </div>

      {/* Vector Distribution Bars */}
      <div className="space-y-3 my-auto">
        {categories.map((key) => {
          const cfg = VECTOR_CONFIG[key];
          const count = counts[key] || 0;
          const pct = Math.round((count / total) * 100);
          const Icon = cfg.icon;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`flex items-center gap-1.5 ${cfg.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
                <span className="text-slate-300 font-semibold">
                  {count} <span className="text-slate-500 font-normal">({pct}%)</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full ${cfg.bg} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${Math.max(count > 0 ? 5 : 0, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-mono text-slate-500">
        <span>6 AI Bots Active</span>
        <span>Dynamic Score Fusion</span>
      </div>
    </div>
  );
};
