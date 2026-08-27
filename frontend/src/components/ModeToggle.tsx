import React from 'react';
import { Radio, PlayCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

interface ModeToggleProps {
  mode: 'LIVE' | 'REPLAY';
  onModeChange: (mode: 'LIVE' | 'REPLAY') => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  const handleToggle = async (newMode: 'LIVE' | 'REPLAY') => {
    if (newMode === mode) return;
    onModeChange(newMode);
    await api.setSystemMode(newMode);
  };

  return (
    <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs font-mono">
      <button
        onClick={() => handleToggle('LIVE')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
          mode === 'LIVE'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {mode === 'LIVE' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${mode === 'LIVE' ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
        </span>
        Live NIC Capture
      </button>

      <button
        onClick={() => handleToggle('REPLAY')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
          mode === 'REPLAY'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <PlayCircle className="w-3.5 h-3.5" />
        PCAP Replay Mode
      </button>
    </div>
  );
};
