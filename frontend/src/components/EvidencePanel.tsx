import React from 'react';
import { ThreatAlert } from '../types/alert';
import { Terminal, Shield, Cpu, KeyRound, Clock, ArrowRight } from 'lucide-react';

interface EvidencePanelProps {
  alert: ThreatAlert;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ alert }) => {
  const { evidence, bot_scores, contributing_bots } = alert;

  return (
    <div className="space-y-4">
      {/* 5-Tuple Network Coordinates */}
      <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 font-mono text-xs">
        <div className="text-slate-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          Network 5-Tuple Flow Vector
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-3 rounded-md border border-slate-800/80">
          <div>
            <div className="text-slate-500 text-[10px]">SOURCE HOST</div>
            <div className="text-red-400 font-bold text-sm">
              {alert.source_ip}
              <span className="text-slate-500 font-normal text-xs ml-1">
                :{evidence.src_port || 49152}
              </span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

          <div>
            <div className="text-slate-500 text-[10px]">TARGET DESTINATION</div>
            <div className="text-cyan-400 font-bold text-sm">
              {alert.target_ip}
              <span className="text-slate-500 font-normal text-xs ml-1">
                :{alert.target_port || 80}
              </span>
            </div>
          </div>

          <div>
            <div className="text-slate-500 text-[10px]">PROTOCOL</div>
            <div className="text-slate-200 font-semibold">{evidence.protocol || 'TCP / TLS'}</div>
          </div>
        </div>
      </div>

      {/* Specialist Bots Confidence Fusion Matrix */}
      <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 font-mono text-xs">
        <div className="text-slate-400 uppercase tracking-wider text-[11px] mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-purple-400">
            <Cpu className="w-3.5 h-3.5" />
            6 Specialist AI Bots Confidence Matrix
          </span>
          <span className="text-[10px] text-slate-500">
            Weighted Score: {(alert.confidence_score * 100).toFixed(1)}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(bot_scores || {}).map(([botName, score]) => {
            const isContributing = contributing_bots.includes(botName);
            const scorePct = Math.round(score * 100);

            return (
              <div
                key={botName}
                className={`p-2.5 rounded-md border transition-all ${
                  isContributing
                    ? 'bg-red-500/10 border-red-500/40 text-red-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="capitalize font-semibold text-[11px]">
                    {botName.replace('_', ' ')}
                  </span>
                  <span className="font-bold">{scorePct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      scorePct > 80 ? 'bg-red-500' : scorePct > 50 ? 'bg-orange-500' : 'bg-slate-600'
                    }`}
                    style={{ width: `${scorePct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Evidence Key-Value Details */}
      <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 font-mono text-xs">
        <div className="text-slate-400 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5 text-cyan-400">
          <KeyRound className="w-3.5 h-3.5" />
          Extracted Feature Indicators
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(evidence || {}).map(([key, val]) => (
            <div key={key} className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
              <div className="text-slate-500 text-[10px] uppercase truncate">{key.replace(/_/g, ' ')}</div>
              <div className="text-slate-200 font-semibold text-xs mt-0.5 truncate">
                {typeof val === 'number'
                  ? val.toLocaleString()
                  : typeof val === 'object'
                  ? JSON.stringify(val)
                  : String(val)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
