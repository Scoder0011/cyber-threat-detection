// src/components/AppShell.tsx

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAlerts } from "../hooks/useAlerts";
import { useMode } from "../hooks/useMode";

/** Breakpoint below which the sidebar collapses to icon-only rail */
const COLLAPSE_BREAKPOINT = 1024;

/**
 * AppShell — persistent two-column layout wrapping all routed pages.
 *
 * Grid columns:
 *   < 1024 px → 64 px sidebar + 1fr content
 *   ≥ 1024 px → 240 px sidebar + 1fr content
 *
 * Exposes `searchQuery` to child pages via Outlet context so pages can call:
 *   const { searchQuery } = useOutletContext<{ searchQuery: string }>();
 */
export function AppShell() {
  const { pathname } = useLocation();
  const { mode, setMode } = useMode();
  const { connectionStatus } = useAlerts();

  // ── Responsive collapsed state ─────────────────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    () => window.innerWidth < COLLAPSE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < COLLAPSE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Search query — passed to pages via Outlet context ─────────────────
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="h-screen grid grid-cols-[64px_1fr] lg:grid-cols-[240px_1fr] text-white overflow-hidden" style={{ background: "radial-gradient(ellipse at 20% 20%, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 60%), #020817" }}>
      {/* Left column — sidebar */}
      <Sidebar collapsed={isCollapsed} />

      {/* Right column — header + page content */}
      <div className="flex flex-col overflow-hidden">
        <Header
          connectionStatus={connectionStatus}
          mode={mode}
          onModeChange={setMode}
          onSearch={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto">
          {/* AnimatePresence keyed on pathname drives page-transition animations */}
          <AnimatePresence mode="wait">
            <Outlet key={pathname} context={{ searchQuery }} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
