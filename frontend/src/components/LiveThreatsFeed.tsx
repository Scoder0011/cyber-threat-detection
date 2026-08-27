// src/components/LiveThreatsFeed.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Lock, Mail, FileText, Hammer, ShieldAlert, Cpu } from 'lucide-react';
import type { Alert } from '../types/alert';

interface LiveThreatsFeedProps {
  alerts: Alert[];
  onSelectAlert?: (alertId: string) => void;
}

interface ThreatFeedItem {
  id: string;
  title: string;
  source: string;
  target: string;
  targetFlag?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timeAgo: string;
  iconType: 'ransomware' | 'phishing' | 'file' | 'bruteforce' | 'ddos' | 'generic';
}

const DEFAULT_FEED_ITEMS: ThreatFeedItem[] = [
  {
    id: 'alert-001',
    title: 'Ransomware Detected',
    source: '192.168.10.45',
    target: 'SERVER-01',
    targetFlag: '🇩🇪',
    severity: 'Critical',
    timeAgo: '8 sec ago',
    iconType: 'ransomware',
  },
  {
    id: 'alert-002',
    title: 'Phishing Attempt Blocked',
    source: '172.217.14.9',
    target: 'sarah@gmail.com',
    severity: 'High',
    timeAgo: '1 min ago',
    iconType: 'phishing',
  },
  {
    id: 'alert-003',
    title: 'Suspicious File Detected',
    source: 'workstation-56',
    target: 'HR-LAPTOP-12',
    targetFlag: '🇺🇸',
    severity: 'Low',
    timeAgo: '44 sec ago',
    iconType: 'file',
  },
  {
    id: 'alert-004',
    title: 'Brute Force Attack',
    source: '192.168.10.45',
    target: 'VPN-GATEWAY',
    targetFlag: '🇨🇭',
    severity: 'Medium',
    timeAgo: '2 min ago',
    iconType: 'bruteforce',
  },
];

function getCategoryIcon(type: ThreatFeedItem['iconType']) {
  switch (type) {
    case 'ransomware':
      return <Lock className="w-4 h-4 text-slate-600" />;
    case 'phishing':
      return <Mail className="w-4 h-4 text-slate-600" />;
    case 'file':
      return <FileText className="w-4 h-4 text-slate-600" />;
    case 'bruteforce':
      return <Hammer className="w-4 h-4 text-slate-600" />;
    case 'ddos':
      return <ShieldAlert className="w-4 h-4 text-slate-600" />;
    default:
      return <Cpu className="w-4 h-4 text-slate-600" />;
  }
}

function getSeverityPill(severity: ThreatFeedItem['severity']) {
  switch (severity) {
    case 'Critical':
      return {
        bg: 'bg-rose-50 text-rose-600 border-rose-200/60',
        label: 'Critical',
      };
    case 'High':
      return {
        bg: 'bg-orange-50 text-orange-600 border-orange-200/60',
        label: 'High',
      };
    case 'Medium':
      return {
        bg: 'bg-amber-50 text-amber-600 border-amber-200/60',
        label: 'Medium',
      };
    case 'Low':
      return {
        bg: 'bg-sky-50 text-sky-600 border-sky-200/60',
        label: 'Low',
      };
  }
}

export function LiveThreatsFeed({ alerts: _alerts, onSelectAlert }: LiveThreatsFeedProps) {
  const items = DEFAULT_FEED_ITEMS;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Live Threats Feed</h2>
        <ArrowUpRight className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
      </div>

      {/* Feed Items List */}
      <div className="space-y-3.5 flex-1">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const sev = getSeverityPill(item.severity);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectAlert?.(item.id)}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                {/* Left: Category Icon Circle + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/70 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                    {getCategoryIcon(item.iconType)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
                      <span className="truncate">{item.source}</span>
                      <span>→</span>
                      {item.targetFlag && <span>{item.targetFlag}</span>}
                      <span className="truncate">{item.target}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Severity Pill + Time Ago */}
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${sev.bg}`}
                  >
                    {sev.label}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.timeAgo}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LiveThreatsFeed;
