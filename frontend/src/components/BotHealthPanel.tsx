import React from 'react';
import { BotMetric } from '../types/alert';
import { Cpu, Activity, Zap, CheckCircle2, AlertTriangle, Radio, Globe, Lock, Search, UploadCloud } from 'lucide-react';

interface BotHealthPanelProps {
  bots: BotMetric[];
}

const BOT_ICONS: Record<string, React.ElementType> = {
  ddos_bot: Zap,
  beaconing_bot: Radio,
  dga_dns_bot: Globe,
  encrypted_malware_bot: Lock,
  scanning_bot: Search,
  exfiltration_bot: UploadCloud,
};

export const BotHealthPanel: React.FC<BotHealthPanelProps> = ({ bots }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bots.map((bot) => {
        const Icon = BOT_ICONS[bot.bot_name] || Cpu;
        const isHealthy = bot.status === 'HEALTHY';

        return (
          <div
            key={bot.bot_name}
            className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 flex flex-col justify-between"
          >
            {/* Bot Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {bot.display_name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">v{bot.version}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isHealthy
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {isHealthy ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                )}
                {bot.status}
              </span>
            </div>

            {/* Performance Gauges */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 my-3 font-mono text-center">
              <div>
                <div className="text-slate-500 text-[10px]">LATENCY</div>
                <div className="text-cyan-400 font-bold text-xs mt-0.5">{bot.latency_ms} ms</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">CPU</div>
                <div className="text-slate-200 font-bold text-xs mt-0.5">{bot.cpu_percent}%</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">MEMORY</div>
                <div className="text-slate-200 font-bold text-xs mt-0.5">{bot.memory_mb} MB</div>
              </div>
            </div>

            {/* Prediction Counts & Accuracy */}
            <div className="space-y-1.5 font-mono text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Total Predictions:</span>
                <span className="text-slate-200 font-semibold">{bot.predictions_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Threats Flagged:</span>
                <span className="text-red-400 font-bold">{bot.threats_detected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Model Accuracy / F1:</span>
                <span className="text-emerald-400 font-semibold">
                  {(bot.accuracy_score * 100).toFixed(1)}% / {(bot.f1_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
