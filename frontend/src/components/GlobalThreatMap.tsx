// src/components/GlobalThreatMap.tsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info, Maximize2, Plus, Minus, Crosshair, Globe as GlobeIcon, Radio } from 'lucide-react';
import type { Alert } from '../types/alert';

interface GlobalThreatMapProps {
  alerts?: Alert[];
}

interface AttackOrigin {
  country: string;
  flag: string;
  count: number;
}

function resolveCountry(ip: string): { country: string; flag: string } {
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')) {
    return { country: 'Internal Network', flag: '🛡️' };
  }
  if (ip.startsWith('45.') || ip.startsWith('185.')) {
    return { country: 'Germany', flag: '🇩🇪' };
  }
  if (ip.startsWith('91.') || ip.startsWith('95.')) {
    return { country: 'Russia', flag: '🇷🇺' };
  }
  if (ip.startsWith('103.') || ip.startsWith('114.')) {
    return { country: 'China', flag: '🇨🇳' };
  }
  if (ip.startsWith('198.') || ip.startsWith('172.')) {
    return { country: 'United States', flag: '🇺🇸' };
  }
  if (ip.startsWith('80.') || ip.startsWith('82.')) {
    return { country: 'Netherlands', flag: '🇳🇱' };
  }
  return { country: 'Global Public IP', flag: '🌐' };
}

export function GlobalThreatMap({ alerts = [] }: GlobalThreatMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [activeTool, setActiveTool] = useState<'target' | 'globe' | 'pulse'>('target');

  // Compute dynamic top attack origins from real alerts array
  const topAttackOrigins = useMemo<AttackOrigin[]>(() => {
    if (!alerts || alerts.length === 0) {
      return [];
    }

    const counts: Record<string, { flag: string; count: number }> = {};
    for (const alert of alerts) {
      const { country, flag } = resolveCountry(alert.sourceIp);
      if (!counts[country]) {
        counts[country] = { flag, count: 0 };
      }
      counts[country].count += 1;
    }

    return Object.entries(counts)
      .map(([country, data]) => ({
        country,
        flag: data.flag,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [alerts]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]">
      {/* Header Bar */}
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Global Threat Activity</h2>
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
        </div>

        <div className="flex items-center gap-2">
          {/* Region Dropdown */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 pl-3 pr-7 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All Regions">All Regions</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia Pacific">Asia Pacific</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
              ▾
            </div>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Expand Map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Dotted Matrix World Map with Attack Arcs */}
      <div className="relative flex-1 w-full my-2 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 950 480"
          className="w-full h-full object-contain"
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }}
        >
          <defs>
            {/* Gradients for Multi-Color Attack Arcs */}
            <linearGradient id="arcRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="arcOrange" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="arcGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#86efac" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="arcBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
            </linearGradient>

            {/* Dot Pattern Generator */}
            <pattern id="dotPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="1.2" fill="#cbd5e1" opacity="0.75" />
            </pattern>
          </defs>

          {/* Dotted Continents Outlines */}
          <g fill="url(#dotPattern)">
            {/* North America */}
            <path d="M 120 70 Q 200 60 270 90 Q 260 180 200 240 Q 150 200 110 140 Z" />
            <path d="M 160 210 Q 190 260 210 300 Q 180 300 160 240 Z" />
            {/* South America */}
            <path d="M 220 280 Q 290 290 310 360 Q 280 440 240 450 Q 210 370 220 280 Z" />
            {/* Europe */}
            <path d="M 440 70 Q 520 70 540 140 Q 480 170 430 140 Q 420 90 440 70 Z" />
            {/* Africa */}
            <path d="M 430 170 Q 530 170 540 260 Q 510 380 460 380 Q 420 300 420 200 Z" />
            {/* Asia */}
            <path d="M 540 60 Q 750 50 830 140 Q 780 260 620 240 Q 560 160 540 60 Z" />
            {/* Australia */}
            <path d="M 720 310 Q 820 300 830 380 Q 760 410 710 370 Z" />
          </g>

          {/* Dynamic Attack Arcs based on active threats */}
          {alerts.length > 0 && (
            <>
              {/* Arc 1: Red (US to SOC target) */}
              <path
                d="M 190 140 Q 300 60 420 250"
                fill="none"
                stroke="url(#arcRed)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              {/* Arc 2: Orange (Europe to SOC target) */}
              <path
                d="M 480 120 Q 450 180 420 250"
                fill="none"
                stroke="url(#arcOrange)"
                strokeWidth="2"
              />
              {/* Arc 3: Green (Asia to SOC target) */}
              <path
                d="M 620 170 Q 520 220 420 250"
                fill="none"
                stroke="url(#arcGreen)"
                strokeWidth="2"
              />
            </>
          )}

          {/* Glowing Map Target & Origin Nodes */}
          {/* Origin Node: Central Red Target with Pulse */}
          <circle cx="420" cy="250" r="16" fill="#ef4444" fillOpacity="0.15" />
          <circle cx="420" cy="250" r="8" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
          <circle cx="420" cy="250" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

          {/* US Node */}
          <circle cx="190" cy="140" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          {/* Europe Node */}
          <circle cx="480" cy="120" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          {/* Asia Node */}
          <circle cx="620" cy="170" r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
        </svg>

        {/* Floating Zoom Controls (Bottom Left) */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <div className="bg-slate-100/90 backdrop-blur border border-slate-200 rounded-xl p-0.5 flex flex-col shadow-sm">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="w-3 mx-auto h-px bg-slate-200" />
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-100/90 backdrop-blur border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTool('target')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'target' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('globe')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'globe' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GlobeIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('pulse')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'pulse' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Floating Top Attack Origin Card (Bottom Right) - DYNAMIC FROM REAL ALERTS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 shadow-md w-44 sm:w-52"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Top Attack Origin
          </div>
          {topAttackOrigins.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">No origin data recorded</p>
          ) : (
            <div className="space-y-1.5 text-xs">
              {topAttackOrigins.map((item) => (
                <div key={item.country} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{item.flag}</span>
                    <span className="text-[11px] font-medium truncate">{item.country}</span>
                  </div>
                  <span className="font-semibold text-slate-900 text-[11px] tabular-nums">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default GlobalThreatMap;
