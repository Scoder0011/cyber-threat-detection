import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Tooltip } from "../common/Tooltip";

export const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Tooltip content={isDark ? "Switch to light theme" : "Switch to dark theme"} position="bottom">
      <button
        id="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/[0.08] shadow-xs active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${className}`}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          {/* Sun icon for dark mode (click to go light) */}
          <Sun
            className={`w-4 h-4 text-amber-400 absolute transition-all duration-300 transform ${
              isDark
                ? "rotate-0 opacity-100 scale-100"
                : "-rotate-90 opacity-0 scale-50 pointer-events-none"
            }`}
          />
          {/* Moon icon for light mode (click to go dark) */}
          <Moon
            className={`w-4 h-4 text-slate-700 absolute transition-all duration-300 transform ${
              !isDark
                ? "rotate-0 opacity-100 scale-100"
                : "rotate-90 opacity-0 scale-50 pointer-events-none"
            }`}
          />
        </div>
      </button>
    </Tooltip>
  );
};
