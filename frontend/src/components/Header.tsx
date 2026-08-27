// src/components/Header.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ConnectionStatusBadge from "./ConnectionStatusBadge";
import { ModeToggle } from "./ModeToggle";
import type { ConnectionStatus } from "../types/alert";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  mode: "live" | "replay";
  onModeChange: (mode: "live" | "replay") => void;
  onSearch: (query: string) => void;
}

export function Header({ connectionStatus, mode, onModeChange, onSearch }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(value), 300);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass border-b border-white/5 px-6 py-3 flex items-center gap-4"
    >
      {/* Search */}
      <div className={`relative flex-1 max-w-md transition-all duration-300 ${focused ? "max-w-lg" : ""}`}>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={200}
          aria-label="Global search"
          placeholder="Search threats, IPs, alerts…"
          className="w-full glass rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 transition-all border border-white/5 focus:border-cyan-400/30"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <ConnectionStatusBadge status={connectionStatus} />
        <ModeToggle value={mode} onChange={onModeChange} />
      </div>
    </motion.header>
  );
}

export default Header;
