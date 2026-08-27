import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Cpu, Bell, ExternalLink } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

interface NavbarProps {
  activeTab: 'dashboard' | 'health';
  onTabChange: (tab: 'dashboard' | 'health') => void;
  mode: 'LIVE' | 'REPLAY';
  onModeChange: (mode: 'LIVE' | 'REPLAY') => void;
  unreadAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  mode,
  onModeChange,
  unreadAlertCount,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/90 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-neon-cyan flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Cyber Threat Detection
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SOC v2.4
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              6 Specialist AI Bots Online | Redis Stream Active
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Threat Dashboard
            {unreadAlertCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('health')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${
              activeTab === 'health'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            System & Bot Telemetry
          </button>
        </nav>

        {/* Right Action Bar: Mode Toggle & UTC Time */}
        <div className="flex items-center gap-4">
          <ModeToggle mode={mode} onModeChange={onModeChange} />

          <div className="hidden xl:flex flex-col text-right font-mono text-[11px] text-slate-400">
            <span className="text-slate-200">{utcTime || 'Syncing UTC...'}</span>
            <span className="text-[9px] text-slate-500">Polygon Amoy Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
};
