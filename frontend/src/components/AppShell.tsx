// src/components/AppShell.tsx

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Header } from "./Header";
import { ChatAI } from "./ChatAI";
import { useAlerts } from "../hooks/useAlerts";
import { useMode } from "../hooks/useMode";

export function AppShell() {
  const { pathname } = useLocation();
  const { mode, setMode } = useMode();
  const { connectionStatus } = useAlerts();

  // ── Search query — passed to pages via Outlet context ─────────────────
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header & Navigation */}
      <Header
        connectionStatus={connectionStatus}
        mode={mode}
        onModeChange={setMode}
        onSearch={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
        {/* AnimatePresence keyed on pathname drives page-transition animations */}
        <AnimatePresence mode="wait">
          <Outlet key={pathname} context={{ searchQuery }} />
        </AnimatePresence>
      </main>

      {/* Floating AI SOC Assistant */}
      <ChatAI />
    </div>
  );
}

export default AppShell;
