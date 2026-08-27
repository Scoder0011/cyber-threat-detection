import React from 'react';
import { BotMetric } from '../types/alert';
import { BotHealthPanel } from '../components/BotHealthPanel';
import { Cpu, Server, Database, Radio, CheckCircle, RefreshCw, Zap } from 'lucide-react';

interface SystemHealthProps {
  bots: BotMetric[];
  onRefresh: () => void;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ bots, onRefresh }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Specialist AI Bots & Subsystem Telemetry
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time inference latency, container resource consumption, and detection accuracy
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors font-mono text-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* 6 Specialist AI Bots Grid */}
      <BotHealthPanel bots={bots} />

      {/* Core Infrastructure Pipeline Status */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">
          <Server className="w-4 h-4 text-cyan-400" />
          Infrastructure & Streaming Pipeline Services
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          {/* Redis Streaming */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                Redis Stream Event Bus
              </div>
              <div className="text-slate-500 text-[11px]">Stream: `flows:stream`</div>
              <div className="text-emerald-400 font-bold text-xs pt-1">
                Connected (0.45 ms latency)
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          {/* Supabase PostgreSQL */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                Supabase Relational DB
              </div>
              <div className="text-slate-500 text-[11px]">Realtime Publication: Active</div>
              <div className="text-cyan-400 font-bold text-xs pt-1">
                Healthy (10 conn in pool)
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          </div>

          {/* Polygon Amoy RPC */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                Web3 RPC Ledger Node
              </div>
              <div className="text-slate-500 text-[11px]">Polygon Amoy (EVM)</div>
              <div className="text-purple-400 font-bold text-xs pt-1">
                Block #18459225 Synced
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
