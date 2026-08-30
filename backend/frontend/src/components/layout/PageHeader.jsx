import React, { useState } from "react";
import {
  RotateCw,
  Calendar,
  Download,
  MoreHorizontal,
  ChevronDown,
  Clock,
  Sparkles,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  Layers,
  Check
} from "lucide-react";
import { Tooltip } from "../common/Tooltip";
import { Button } from "../common/Button";

export const PageHeader = ({
  activeTab = "overview",
  onRefresh,
  isRefreshing,
  lastSyncTime = "2 min ago",
  onExport,
  isLoadingSkeletons,
  onToggleSkeletons,
}) => {
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Jul 1, 2026 00:00 - Jul 31, 2026 23:59");
  const [isExporting, setIsExporting] = useState(false);

  const titleMap = {
    overview: "Overview",
    "threat-feed": "Live Threat Intelligence Feed",
    incidents: "Security Incidents",
    vulnerabilities: "Vulnerability Management",
    endpoints: "Endpoint Security & Fleet Telemetry",
  };

  const subtitleMap = {
    overview: "Real-time SOC telemetry, global attack vectors, and automated threat mitigation posture.",
    "threat-feed": "Continuous stream of endpoint, firewall, and identity anomaly detections.",
    incidents: "Active security investigations, root-cause analyses, and containment playbooks.",
    vulnerabilities: "CVE exposure scanning, unpatched asset discovery, and remediation priority.",
    endpoints: "Agent health, EDR telemetry, isolation status, and active defense monitors.",
  };

  const presetRanges = [
    "Jul 1, 2026 00:00 - Jul 31, 2026 23:59",
    "Last 24 Hours",
    "Last 7 Days",
    "Previous Month",
    "Custom Time Range...",
  ];

  const handleExportClick = async (type = "csv") => {
    setIsExporting(true);
    // TODO: replace with real action once backend is merged
    await new Promise((r) => setTimeout(r, 1200));
    onExport(type);
    setIsExporting(false);
  };

  return (
    <div className="mb-6 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Title and Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 tracking-wide uppercase">
            <span>SOC Control Center</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-600 dark:text-slate-400">{titleMap[activeTab] || "Overview"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#E4E6EB] tracking-tight flex items-center gap-3">
            {titleMap[activeTab] || "Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {subtitleMap[activeTab]}
          </p>
        </div>

        {/* Right: Unified Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start lg:self-center">
          
          {/* Last Sync Button */}
          <Tooltip content="Sync latest SOC telemetry" position="bottom">
            <button
              id="refresh-sync-btn"
              onClick={onRefresh}
              aria-label="Sync latest SOC telemetry"
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1E27] border border-slate-200/90 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-card dark:shadow-card-dark active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 h-9"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${
                  isRefreshing ? "animate-spin text-blue-700 dark:text-blue-300" : ""
                }`}
              />
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Last sync:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{lastSyncTime}</span>
            </button>
          </Tooltip>

          {/* Date Range Picker */}
          <div className="relative">
            <Tooltip content="Change reporting time window" position="bottom">
              <button
                id="date-range-picker-btn"
                onClick={() => {
                  setShowDateMenu(!showDateMenu);
                  setShowMoreMenu(false);
                }}
                aria-label="Select date range"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1E27] border border-slate-200/90 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-card dark:shadow-card-dark active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 h-9"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-slate-800 dark:text-slate-200 text-[11.5px]">
                  {selectedRange}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </Tooltip>

            {/* Date Range Dropdown */}
            {showDateMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1A1E27] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-white/[0.08] py-2 z-30 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Time Window
                </div>
                {presetRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedRange(range);
                      setShowDateMenu(false);
                      onRefresh();
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                      selectedRange === range
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{range}</span>
                    {selectedRange === range && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <Button
            id="export-soc-report-btn"
            variant="primary"
            size="md"
            tooltip="Export SOC telemetry report"
            tooltipPosition="bottom"
            isLoading={isExporting}
            onClick={() => handleExportClick("csv")}
            icon={<Download className="w-3.5 h-3.5" />}
            className="h-9 shadow-md shadow-blue-500/20"
          >
            Export
          </Button>

          {/* More Options Dropdown */}
          <div className="relative">
            <Tooltip content="More options" position="bottom">
              <button
                id="more-options-btn"
                onClick={() => {
                  setShowMoreMenu(!showMoreMenu);
                  setShowDateMenu(false);
                }}
                aria-label="More options"
                className="p-2 rounded-xl bg-white dark:bg-[#1A1E27] border border-slate-200/90 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-card dark:shadow-card-dark active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 h-9 flex items-center justify-center"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </Tooltip>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#1A1E27] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-white/[0.08] py-2 z-30 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Telemetry Formats
                </div>
                
                <button
                  onClick={() => {
                    handleExportClick("json");
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Download Raw Telemetry (JSON)</span>
                </button>

                <button
                  onClick={() => {
                    handleExportClick("pdf");
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Print Executive Briefing (PDF)</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                {/* Skeletons Preview Toggle for Dev/QA */}
                <button
                  onClick={() => {
                    onToggleSkeletons();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Demo Skeletons State</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isLoadingSkeletons
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isLoadingSkeletons ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
