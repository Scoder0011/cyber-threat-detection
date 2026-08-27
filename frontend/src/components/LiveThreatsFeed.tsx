// src/components/LiveThreatsFeed.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Lock, Mail, FileText, Hammer, ShieldAlert, Cpu, ShieldCheck } from 'lucide-react';
import type { Alert } from '../types/alert';

interface LiveThreatsFeedProps {
  alerts: Alert[];
  onSelectAlert?: (alertId: string) => void;
}

function getCategoryIcon(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes('ransomware') || lower.includes('crypto')) {
    return <Lock className="w-4 h-4 text-rose-600" />;
  }
  if (lower.includes('phish') || lower.includes('mail')) {
    return <Mail className="w-4 h-4 text-orange-600" />;
  }
  if (lower.includes('malware') || lower.includes('file') || lower.includes('trojan')) {
    return <FileText className="w-4 h-4 text-sky-600" />;
  }
  if (lower.includes('brute') || lower.includes('auth') || lower.includes('ssh')) {
    return <Hammer className="w-4 h-4 text-amber-600" />;
  }
  if (lower.includes('ddos') || lower.includes('flood') || lower.includes('syn')) {
    return <ShieldAlert className="w-4 h-4 text-red-600" />;
  }
  return <Cpu className="w-4 h-4 text-blue-600" />;
}

function getSeverityPill(severity: string) {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-50 text-rose-600 border-rose-200/60';
    case 'High':
      return 'bg-orange-50 text-orange-600 border-orange-200/60';
    case 'Medium':
      return 'bg-amber-50 text-amber-600 border-amber-200/60';
    case 'Low':
    default:
      return 'bg-sky-50 text-sky-600 border-sky-200/60';
  }
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.max(1, Math.floor(diffMs / 1000));
    if (diffSec < 60) return `${diffSec} sec ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Just now';
  }
}

function getIpFlag(ip: string): string {
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')) {
    return '🛡️';
  }
  if (ip.startsWith('45.') || ip.startsWith('185.')) return '🇩🇪';
  if (ip.startsWith('91.') || ip.startsWith('95.')) return '🇷🇺';
  if (ip.startsWith('103.') || ip.startsWith('114.')) return '🇨🇳';
  if (ip.startsWith('198.') || ip.startsWith('172.')) return '🇺🇸';
  if (ip.startsWith('80.') || ip.startsWith('82.')) return '🇳🇱';
  return '🌐';
}

export function LiveThreatsFeed({ alerts, onSelectAlert }: LiveThreatsFeedProps) {
  const displayAlerts = alerts.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[380px]">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Live Threats Feed</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {alerts.length} Total
          </span>
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
      </div>

      {/* Feed Items List from Real Alerts */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {displayAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No active threat alerts</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Monitoring live network telemetry stream...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayAlerts.map((alert) => {
              const pillClass = getSeverityPill(alert.severity);
              const flag = getIpFlag(alert.sourceIp);

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectAlert?.(alert.id)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  {/* Left: Category Icon Circle + Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/70 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                      {getCategoryIcon(alert.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {alert.type}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
                        <span>{flag}</span>
                        <span className="truncate">{alert.sourceIp}</span>
                        <span>→</span>
                        <span className="truncate">
                          {alert.destinationIp}
                          {alert.targetPort ? `:${alert.targetPort}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Severity Pill + Time Ago */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${pillClass}`}
                    >
                      {alert.severity}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {formatRelativeTime(alert.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default LiveThreatsFeed;
