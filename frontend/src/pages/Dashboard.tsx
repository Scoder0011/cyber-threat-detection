import { useEffect, useState } from "react";
import { AlertsFeed } from "@/components/AlertsFeed";
import { BotHealthGrid } from "@/components/BotHealthGrid";
import { ChatbotPanel } from "@/components/ChatbotPanel";
import { LiveTrafficPanel } from "@/components/LiveTrafficPanel";
import { TopBar } from "@/components/TopBar";
import { WorldMap } from "@/components/WorldMap";
import type { BotMetric, NetworkFlow, ThreatAlert } from "@/types/dashboard";

const base = import.meta.env.VITE_API_BASE_URL ?? "";
const wsBase = import.meta.env.VITE_WS_BASE_URL || base.replace(/^http/, "ws");
async function get<T>(path: string): Promise<T> { const response = await fetch(`${base}${path}`); if (!response.ok) throw new Error(`GET ${path} failed`); return response.json() as Promise<T>; }
export function Dashboard({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]); const [flows, setFlows] = useState<NetworkFlow[]>([]); const [bots, setBots] = useState<BotMetric[]>([]); const [streaming, setStreaming] = useState(false); const [error, setError] = useState("");
  useEffect(() => { let alive = true; const load = async () => { try { const [a, f, b] = await Promise.all([get<ThreatAlert[]>("/api/alerts?limit=50"), get<NetworkFlow[]>("/api/flows?limit=50"), get<BotMetric[]>("/api/bots/health")]); if (alive) { setAlerts(a); setFlows(f); setBots(b); setError(""); } } catch { if (alive) setError("The API is unavailable. Showing live data when the connection is restored."); } }; void load(); const poll = window.setInterval(() => void load(), 3000); return () => { alive = false; window.clearInterval(poll); }; }, []);
  useEffect(() => { if (!wsBase) return; let retry: number | undefined; let stopped = false; let socket: WebSocket | null = null; const connect = () => { socket = new WebSocket(`${wsBase}/ws/flows`); socket.onopen = () => setStreaming(true); socket.onmessage = event => { try { const flow = JSON.parse(event.data) as NetworkFlow; setFlows(current => [flow, ...current.filter(item => item.id !== flow.id)].slice(0, 50)); } catch { /* ignore malformed stream frames */ } }; socket.onclose = () => { setStreaming(false); if (!stopped) retry = window.setTimeout(connect, 5000); }; socket.onerror = () => socket?.close(); }; connect(); return () => { stopped = true; if (retry) window.clearTimeout(retry); socket?.close(); }; }, []);
  return <main className="min-w-0 flex-1"><TopBar dark={dark} onToggle={onToggleTheme} criticals={alerts.filter(a => a.severity === "CRITICAL").length}/><div className="p-4 sm:p-6"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Situation room</p><h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Monitor threats as they emerge.</h2></div><span className="hidden font-mono text-xs text-slate-400 sm:block">UTC · auto-refresh 3s</span></div>{error && <p className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">{error}</p>}<div className="grid grid-cols-12 gap-4"><WorldMap flows={flows} alerts={alerts}/><LiveTrafficPanel flows={flows} connected={streaming}/><BotHealthGrid bots={bots}/><AlertsFeed alerts={alerts}/></div></div><ChatbotPanel/></main>;
}
