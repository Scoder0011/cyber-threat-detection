// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useMode } from "../hooks/useMode";

interface SidebarProps {
  collapsed: boolean;
}

const NAV_LINKS = [
  { to: "/", icon: "⬡", label: "Dashboard", end: true },
  { to: "/system-health", icon: "♡", label: "System Health", end: false },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const { mode } = useMode();

  return (
    <aside
      className={`glass-strong h-full flex flex-col transition-all duration-300 z-10 relative ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <motion.div
          whileHover={{ rotate: 20, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-2xl flex-shrink-0 text-cyan-400"
          aria-hidden="true"
        >
          🛡
        </motion.div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white font-bold text-sm tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
          >
            CyberShield
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2" aria-label="Main navigation">
        {NAV_LINKS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                isActive
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-base flex-shrink-0 ${isActive ? "text-cyan-400" : "opacity-60"}`} aria-hidden="true">
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mode badge */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          <span
            className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${mode === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
            aria-label={`Mode: ${mode === "live" ? "Live" : "Replay"}`}
          />
          {!collapsed && (
            <span className={`text-xs font-medium ${mode === "live" ? "text-emerald-400" : "text-amber-400"}`}>
              {mode === "live" ? "LIVE" : "REPLAY"}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
