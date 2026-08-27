import React, { useState } from 'react';
import { ThroughputDataPoint } from '../types/alert';
import { Activity, Zap, HardDrive } from 'lucide-react';

interface ThroughputChartProps {
  data: ThroughputDataPoint[];
}

export const ThroughputChart: React.FC<ThroughputChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'flows' | 'packets' | 'bandwidth'>('flows');

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        Awaiting telemetry data stream...
      </div>
    );
  }

  // Determine active metric values
  const values = data.map((d) => {
    if (metric === 'flows') return d.flowsPerSec;
    if (metric === 'packets') return d.packetsPerSec;
    return d.bandwidthMbps;
  });

  const maxVal = Math.max(...values, 1) * 1.15;
  const minVal = Math.min(...values, 0) * 0.85;
  const currentVal = values[values.length - 1] || 0;

  // Chart dimensions
  const width = 600;
  const height = 180;
  const padding = 20;

  // Convert points to SVG polyline coordinates
  const points = values.map((val, idx) => {
    const x = padding + (idx / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${padding},${height - padding} L ${points.join(' L ')} L ${width - padding},${height - padding} Z`;

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
      {/* Header & Metric Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
            Live Ingestion Throughput
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {metric === 'bandwidth'
                ? `${currentVal.toFixed(1)} Mbps`
                : `${currentVal.toLocaleString()} ${metric === 'flows' ? 'flows/s' : 'pkts/s'}`}
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Real-time Ingest
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-lg bg-slate-900/90 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setMetric('flows')}
            className={`px-3 py-1 rounded-md transition-colors ${
              metric === 'flows'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flows/s
          </button>
          <button
            onClick={() => setMetric('packets')}
            className={`px-3 py-1 rounded-md transition-colors ${
              metric === 'packets'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Packets/s
          </button>
          <button
            onClick={() => setMetric('bandwidth')}
            className={`px-3 py-1 rounded-md transition-colors ${
              metric === 'bandwidth'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mbps
          </button>
        </div>
      </div>

      {/* SVG Time Series Graph */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1f2937" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1f2937" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" />

          {/* Filled Area */}
          <path
            d={areaD}
            fill={
              metric === 'flows'
                ? 'url(#cyanGradient)'
                : metric === 'packets'
                ? 'url(#purpleGradient)'
                : 'url(#emeraldGradient)'
            }
          />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={metric === 'flows' ? '#06b6d4' : metric === 'packets' ? '#a855f7' : '#10b981'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current pulse dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].split(',')[0]}
              cy={points[points.length - 1].split(',')[1]}
              r="4.5"
              fill={metric === 'flows' ? '#22d3ee' : metric === 'packets' ? '#c084fc' : '#34d399'}
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Footer Timestamp labels */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
        <span>-20s ago</span>
        <span>-10s</span>
        <span>Now (Live)</span>
      </div>
    </div>
  );
};
