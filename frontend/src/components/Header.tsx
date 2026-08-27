// src/components/Header.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  RefreshCw,
  Calendar,
  Download,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import ConnectionStatusBadge from "./ConnectionStatusBadge";
import { ModeToggle } from "./ModeToggle";
import type { ConnectionStatus } from "../types/alert";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  mode: "live" | "replay";
  onModeChange: (mode: "live" | "replay") => void;
  onSearch: (query: string) => void;
}

const NAV_TABS = [
  { label: "Overview", path: "/" },
  { label: "Threat Feed", path: "/#threat-feed" },
  { label: "Incidents", path: "/#incidents" },
  { label: "Vulnerabilities", path: "/system-health" },
  { label: "Endpoints", path: "/system-health" },
];

export function Header({ connectionStatus, mode, onModeChange, onSearch }: HeaderProps) {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [lastSyncMinutes, setLastSyncMinutes] = useState(2);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncMinutes((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value), 300);
  }, [onSearch]);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      {/* ── Top Bar: Logo, Navigation Pills, User Profile ── */}
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M4 4h5l11 16h-5z" opacity="0.9" />
              <path d="M10 4h5l-11 16h-5z" opacity="0.6" />
            </svg>
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
            threatlens
          </span>
        </Link>

        {/* Center Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/60 text-xs font-semibold">
          {NAV_TABS.map((tab) => {
            const isActive =
              tab.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.label}
                to={tab.path}
                className={`px-4 py-1.5 rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Status, Bell, User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-2">
            <ConnectionStatusBadge status={connectionStatus} />
            <ModeToggle value={mode} onChange={onModeChange} />
          </div>

          {/* Bell Icon */}
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Alex Morgan"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
            />
            <div className="hidden sm:block text-left text-xs">
              <p className="font-bold text-slate-900 leading-none">Alex Morgan</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">SOC Analyst</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* ── Sub-Bar: Page Title, Last Sync, Date Range, Export ── */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Overview Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Last sync: {lastSyncMinutes} min ago</span>
            </div>
          </div>

          {/* Right: Date Range Picker + Export + More Options */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input for accessibility */}
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search..."
                className="bg-white text-slate-700 text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:border-blue-500 w-32 sm:w-44"
                aria-label="Global search"
              />
            </div>

            {/* Date Range Pill */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Jul 1, 2026 00:00 - Jul 31, 2026 23:59</span>
            </div>

            {/* Export Button */}
            <button
              type="button"
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {/* Context Menu Button */}
            <button
              type="button"
              className="p-1.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
