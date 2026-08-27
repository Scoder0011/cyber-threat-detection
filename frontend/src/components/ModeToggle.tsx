import { useEffect, useState } from "react";
import { api } from "@/api/client";
import type { SystemMode } from "@/types/alert";

export function ModeToggle() {
  const [mode, setMode] = useState<SystemMode | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    api.getMode().then((r) => setMode(r.mode)).catch(() => setMode("live"));
  }, []);

  async function toggle() {
    if (!mode || pending) return;
    const next: SystemMode = mode === "live" ? "replay" : "live";
    setPending(true);
    try {
      const res = await api.setMode(next);
      setMode(res.mode);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending || !mode}
      className="flex items-center gap-2 rounded-full border border-hairline bg-panel2 px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-flow disabled:opacity-50"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${mode === "live" ? "bg-signal-low animate-pulse" : "bg-flow"}`}
      />
      {mode ? mode.toUpperCase() : "…"}
    </button>
  );
}