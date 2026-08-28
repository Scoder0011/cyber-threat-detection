import React, { useState, useEffect } from "react";
import { 
  Network, Cpu, Bot, Database, Activity, ShieldCheck,
  Server, Globe, ArrowDown, ActivitySquare, ShieldAlert,
  Loader2, CheckCircle2, AlertTriangle, XCircle, Link
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function SystemArchitectureView() {
  const [bots, setBots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
        const res = await fetch(`${baseUrl}/bots/health`, {
          headers: {
            "Authorization": `Bearer ${session?.access_token || ""}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch bot health");
        const data = await res.json();
        setBots(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBots();
    // Poll every 10 seconds
    const interval = setInterval(fetchBots, 10000);
    return () => clearInterval(interval);
  }, [session]);

  const StatusBadge = ({ status }) => {
    switch (status) {
      case "HEALTHY":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Healthy
          </div>
        );
      case "DEGRADED":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Degraded
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
            <XCircle className="w-3 h-3" /> Offline
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Network className="w-6 h-6 text-blue-500" /> AI System Architecture & Data Flow
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Real-time visualization of the SOC data ingestion pipeline, feature extraction, AI bot inference, and alert generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: DATA FLOW DIAGRAM */}
        <div className="bg-white dark:bg-[#1A1E27] rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-card dark:shadow-card-dark p-8">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-2 uppercase tracking-wide">
            <ActivitySquare className="w-4 h-4 text-emerald-500" /> Pipeline Flow
          </h3>

          <div className="flex flex-col items-center max-w-sm mx-auto space-y-2 relative">
            
            {/* Step 1 */}
            <div className="w-full bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-sky-800 dark:text-sky-300 shadow-sm relative z-10">
              <Globe className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold text-sm">Receive Traffic</div>
                <div className="text-[10px] opacity-80">(PCAP / NetFlow / Live Capture)</div>
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 my-1 animate-pulse" />

            {/* Step 2 */}
            <div className="w-full bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-teal-800 dark:text-teal-300 shadow-sm relative z-10">
              <Cpu className="w-6 h-6" />
              <div className="font-bold text-sm">Feature Extractor</div>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 my-1 animate-pulse" />

            {/* Step 3: AI Bots */}
            <div className="w-full p-4 rounded-2xl border border-dashed border-rose-300 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/10 relative z-10">
              <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-4">
                <Bot className="w-5 h-5" /> Send Features to AI Bots
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["DDoS Bot", "Beaconing Bot", "DGA DNS Bot", "Encrypted Malware Bot", "Scanning Bot", "Exfiltration Bot"].map(b => (
                  <div key={b} className="bg-white dark:bg-[#12151C] border border-rose-100 dark:border-rose-900/50 rounded-xl p-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-rose-800 dark:text-rose-200 shadow-sm">
                    <Bot className="w-3.5 h-3.5" /> {b}
                  </div>
                ))}
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 my-1 animate-pulse" />

            {/* Step 4: Redis */}
            <div className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-rose-800 dark:text-rose-300 shadow-sm relative z-10">
              <Database className="w-5 h-5" />
              <div className="font-bold text-sm">Redis Event Bus + Sliding Window</div>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 my-1 animate-pulse" />

            {/* Step 5: Controller */}
            <div className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-emerald-800 dark:text-emerald-300 shadow-sm relative z-10">
              <Activity className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold text-sm">Main Controller</div>
                <div className="text-[10px] opacity-80">(Score Fusion)</div>
              </div>
            </div>

            <div className="flex w-full justify-around mt-1">
              <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 animate-pulse translate-x-4" />
              <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 animate-pulse -translate-x-4" />
            </div>

            {/* Step 6: Storage */}
            <div className="w-full grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 text-emerald-800 dark:text-emerald-400 text-center">
                <Database className="w-5 h-5" />
                <div className="text-[10px] font-bold">Save Alert in PostgreSQL</div>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 text-emerald-800 dark:text-emerald-400 text-center">
                <Link className="w-5 h-5" />
                <div className="text-[10px] font-bold">Log Alert Hash on Blockchain</div>
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 my-1 animate-pulse" />

            {/* Step 7: Dashboard */}
            <div className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-emerald-800 dark:text-emerald-300 shadow-sm relative z-10">
              <Server className="w-6 h-6" />
              <div className="font-bold text-sm">Push Live Alert to Dashboard</div>
            </div>
            
            <ArrowDown className="w-5 h-5 text-slate-300 dark:text-slate-600 my-1 animate-pulse" />

            <div className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-emerald-800 dark:text-emerald-300 shadow-sm relative z-10">
              <ShieldCheck className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold text-sm">Security Analyst</div>
                <div className="text-[10px] opacity-80">Views Alert + Evidence</div>
              </div>
            </div>

            {/* Ambient Background Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-100 dark:bg-slate-800 -translate-x-1/2 z-0" />
          </div>
        </div>

        {/* RIGHT: AI BOTS STATUS */}
        <div className="bg-white dark:bg-[#1A1E27] rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-card dark:shadow-card-dark p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <Bot className="w-4 h-4 text-blue-500" /> Active AI Specialist Bots
            </h3>
            {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>

          {error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Failed to load bot telemetry: {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bots.map((bot) => (
                <div key={bot.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{bot.display_name}</h4>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{bot.bot_name} • v{bot.version}</div>
                      </div>
                    </div>
                    <StatusBadge status={bot.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Latency</div>
                      <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{bot.latency_ms.toFixed(1)}ms</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">CPU Load</div>
                      <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{bot.cpu_percent.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Predictions</div>
                      <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{bot.predictions_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Threats</div>
                      <div className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">{bot.threats_detected.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px]">
                    <div className="text-slate-500">
                      Accuracy: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{(bot.accuracy_score * 100).toFixed(2)}%</span>
                    </div>
                    <div className="text-slate-500">
                      F1 Score: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{(bot.f1_score * 100).toFixed(2)}%</span>
                    </div>
                    <div className="text-slate-500">
                      RAM: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{bot.memory_mb.toFixed(1)}MB</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {bots.length === 0 && !isLoading && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No bots registered in the system yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
