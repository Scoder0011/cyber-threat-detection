import React, { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  FileCode2,
  Hammer,
  ShieldAlert,
  Play,
  Pause,
  Filter,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  FileText,
  X,
  Loader2
} from "lucide-react";
import { FeedSkeleton } from "../common/SkeletonLoader";
import { Tooltip } from "../common/Tooltip";

const iconTypeMap = {
  lock: Lock,
  mail: Mail,
  file: FileCode2,
  hammer: Hammer,
};

const severityBadgeStyles = {
  Critical: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60",
  High: "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/60",
  Medium: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60",
  Low: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/60",
};

const severityDotStyles = {
  Critical: "bg-rose-500",
  High: "bg-orange-500",
  Medium: "bg-amber-500",
  Low: "bg-blue-500",
};

export const ThreatFeed = ({ isLoading, onSelectThreat, items = [] }) => {
  const [feedItems, setFeedItems] = useState(items);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isIsolating, setIsIsolating] = useState(false);

  useEffect(() => setFeedItems(items), [items]);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  const filteredFeed = feedItems.filter((item) => {
    const matchesSeverity =
      filterSeverity === "All" || item.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const handleIsolateAction = async () => {
    setIsIsolating(true);
    // TODO: replace with real SOAR API action — soar.containment.isolateHost({ hostId })
    await new Promise((r) => setTimeout(r, 1200));
    setIsIsolating(false);
    setSelectedIncident(null);
  };

  return (
    <div className="bg-white dark:bg-[#1A1E27] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 flex flex-col h-full min-h-[500px]">
      
      {/* HEADER */}
      <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60 shadow-xs">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-[#E4E6EB] leading-none">
                Live Threats Feed
              </h2>
              <span className="relative flex h-2 w-2">
                {isLiveActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time inbound telemetry & IOC triggers
            </p>
          </div>
        </div>

        {/* Live Stream Toggle */}
        <Tooltip content={isLiveActive ? "Pause incoming telemetry feed" : "Resume live telemetry stream"} position="left">
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            aria-label="Toggle telemetry stream"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 shadow-xs ${
              isLiveActive
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            {isLiveActive ? (
              <>
                <Pause className="w-3 h-3" />
                <span className="text-[11px] font-mono font-bold">STREAM: LIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="text-[11px] font-mono font-bold">STREAM: PAUSED</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>

      {/* FILTER & SEARCH SUBBAR */}
      <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-[#12151C]/80 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-[190px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search IP, host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-white dark:bg-[#1A1E27] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>

        {/* Severity filter pills */}
        <div className="flex items-center gap-1">
          {["All", "Critical", "High", "Medium", "Low"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-colors ${
                filterSeverity === sev
                  ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* FEED ITEMS LIST */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[380px] space-y-2.5 custom-scrollbar">
        {filteredFeed.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
            <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            No threats match the current search filter
          </div>
        ) : (
          filteredFeed.map((item) => {
            const IconComponent = iconTypeMap[item.iconType] || ShieldAlert;
            const badgeClass = severityBadgeStyles[item.severity] || "bg-slate-50 text-slate-700";
            const dotClass = severityDotStyles[item.severity] || "bg-slate-400";

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedIncident(item);
                  if (onSelectThreat) onSelectThreat(item);
                }}
                className="p-3.5 rounded-xl bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/[0.05] hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 hover:shadow-xs transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group"
              >
                {/* Left: Threat Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                      item.severity === "Critical"
                        ? "bg-rose-100/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                        : item.severity === "High"
                        ? "bg-orange-100/80 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400"
                        : item.severity === "Medium"
                        ? "bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                        : "bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-[#E4E6EB] tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {item.title}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.source}</span>
                      <span className="text-slate-400 dark:text-slate-600">→</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1">
                        <span>{item.destinationFlag}</span>
                        <span>{item.destination}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Severity Badge & Relative Timestamp */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                    {item.severity}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {item.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="p-3.5 bg-slate-50 dark:bg-[#12151C] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="text-[11px] font-mono">
          Showing {filteredFeed.length} active telemetry events
        </span>
        <button
          onClick={() => setSelectedIncident(feedItems[0])}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>Triage Drawer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* QUICK INCIDENT DETAIL MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1E27] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-white/[0.08] animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#E4E6EB]">
                    {selectedIncident.title}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">ID: {selectedIncident.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Source Entity</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedIncident.source}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Host</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedIncident.destinationFlag} {selectedIncident.destination}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">MITRE ATT&CK:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedIncident.mitreTechnique}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">SOAR Defense:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedIncident.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Telemetry Time:</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedIncident.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedIncident(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Close View
              </button>
              <button
                onClick={handleIsolateAction}
                disabled={isIsolating}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isIsolating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Isolating...</span>
                  </>
                ) : (
                  <span>Isolate Host / Block IP</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
