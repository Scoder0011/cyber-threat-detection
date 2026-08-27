// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Cpu } from "lucide-react";
import { useMode } from "../hooks/useMode";

interface SidebarProps {
  collapsed: boolean;
}

const NAV_LINKS = [
  { to: "/", icon: Activity, label: "Threat Dashboard", end: true },
  { to: "/system-health", icon: Cpu, label: "Bot Telemetry", end: false },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const { mode } = useMode();

  return (
    <aside
      className={`glass-strong h-full flex flex-col transition-all duration-300 z-10 relative ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-neon-cyan flex items-center justify-center shrink-0"
        >
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col min-w-0"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-sm tracking-wider truncate">
                CyberShield
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-gray-400 truncate">6 Specialist AI Bots</span>
          </motion.div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-1.5 px-2 font-mono text-xs" aria-label="Main navigation">
        {NAV_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200",
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-gray-400"}`} />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!collapsed && isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-neon-cyan"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Mode badge footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          <span
            className={`inline-block w-2 h-2 rounded-full shrink-0 ${
              mode === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
            aria-label={`Mode: ${mode === "live" ? "Live" : "Replay"}`}
          />
          {!collapsed && (
            <span className={`text-[11px] font-mono font-medium ${mode === "live" ? "text-emerald-400" : "text-amber-400"}`}>
              {mode === "live" ? "LIVE STREAM" : "REPLAY STREAM"}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
