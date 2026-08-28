import React, { useEffect, useState } from "react";
import {
  ShieldPlus,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Clock,
  UserCheck,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { ChartSkeleton } from "../common/SkeletonLoader";

const actionsFor = (insight) => [
  ...(insight.critical ? [{ id: "triage-critical", title: `Triage ${insight.critical} critical incident${insight.critical === 1 ? "" : "s"}`, priority: "Critical", details: "Review the open critical alerts and their evidence in the incident queue.", assignedTo: "SOC on-call", completed: false }] : []),
  ...(insight.active ? [{ id: "review-active", title: `Review ${insight.active} active alert${insight.active === 1 ? "" : "s"}`, priority: "High", details: "Validate source, destination, and bot confidence before containment.", assignedTo: "SOC analyst", completed: false }] : []),
  { id: "verify-bots", title: "Verify deployed bot health", priority: "Medium", details: `${insight.healthyBots || 0} of ${insight.totalBots || 0} bots currently report HEALTHY status.`, assignedTo: "Platform team", completed: insight.totalBots > 0 && insight.healthyBots === insight.totalBots },
];

export const SecurityInsightPanel = ({ isLoading, onActionToggle, insight = {} }) => {
  const [actions, setActions] = useState([]);
  const [expandedActionId, setExpandedActionId] = useState(null);
  const [loadingActionId, setLoadingActionId] = useState(null);

  useEffect(() => setActions(actionsFor(insight)), [insight.active, insight.critical, insight.healthyBots, insight.totalBots]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const completedCount = actions.filter((a) => a.completed).length;
  const progressPercentage = actions.length ? Math.round((completedCount / actions.length) * 100) : 0;

  const toggleActionComplete = async (id, e) => {
    e.stopPropagation();
    setLoadingActionId(id);

    // Simulate async mitigation action
    // TODO: replace with actual SOAR playbook execution API
    await new Promise((r) => setTimeout(r, 900));
    setLoadingActionId(null);

    setActions((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextState = !act.completed;
          if (onActionToggle) {
            onActionToggle(act.title, nextState);
          }
          return { ...act, completed: nextState };
        }
        return act;
      })
    );
  };

  const toggleExpand = (id) => {
    setExpandedActionId(expandedActionId === id ? null : id);
  };

  return (
    <div className="relative rounded-2xl border border-indigo-100/80 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-blue-50/50 dark:from-[#1E1B4B]/40 dark:via-[#1A1E27]/90 dark:to-[#0F172A]/90 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 p-5 flex flex-col justify-between h-full min-h-[380px] overflow-hidden">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP: SHIELD+PLUS ICON & HEADING */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <ShieldPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#E4E6EB] leading-none flex items-center gap-2">
                <span>Security Insight</span>
              </h2>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Cognitive Threat Intelligence Engine
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            LIVE TELEMETRY
          </span>
        </div>

        {/* AI SUMMARY PARAGRAPH */}
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/75 dark:bg-[#12151C]/75 backdrop-blur-xs rounded-xl p-3.5 border border-white/80 dark:border-white/[0.08] shadow-xs mb-4">
          <p>
            Supabase currently reports{" "}
            <strong className="text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1 py-0.2 rounded">
              {insight.critical || 0} critical incident{insight.critical === 1 ? "" : "s"}
            </strong>{" "}
            and <strong className="text-slate-900 dark:text-slate-100 font-semibold">{insight.active || 0} active alerts</strong>.{" "}
            <strong className="text-blue-700 dark:text-blue-400 font-bold">{insight.resolved || 0}</strong> alerts are resolved in the loaded telemetry window.
          </p>
        </div>
      </div>

      {/* RECOMMENDED ACTIONS SECTION */}
      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10.5px]">
            RECOMMENDED ACTIONS
          </span>
          <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {completedCount} of {actions.length} Completed ({progressPercentage}%)
          </span>
        </div>

        {/* THIN PROGRESS BAR */}
        <div className="w-full h-1.5 rounded-full bg-indigo-100 dark:bg-slate-800 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* 3 CHECKLIST ROWS WITH HOVER CHEVRON SLIDE */}
        <div className="space-y-2">
          {actions.map((act) => {
            const isExpanded = expandedActionId === act.id;
            const isLoadingThis = loadingActionId === act.id;

            return (
              <div
                key={act.id}
                onClick={() => toggleExpand(act.id)}
                className={`group rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  act.completed
                    ? "bg-white/85 dark:bg-[#12151C]/85 border-emerald-200/80 dark:border-emerald-900/60 shadow-xs"
                    : "bg-white/95 dark:bg-[#12151C]/95 border-slate-200/90 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm"
                }`}
              >
                {/* Main Row */}
                <div className="p-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Checkbox Icon */}
                    <button
                      onClick={(e) => toggleActionComplete(act.id, e)}
                      disabled={isLoadingThis}
                      aria-label={act.completed ? "Mark action open" : "Mark action completed"}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        act.completed
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      ) : (
                        act.completed && <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>

                    <span
                      className={`text-xs font-semibold truncate ${
                        act.completed
                          ? "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {act.title}
                    </span>
                  </div>

                  {/* Priority & Animated Chevron */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                        act.priority === "Critical"
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                          : act.priority === "High"
                          ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400"
                          : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {act.priority}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform duration-200" />
                    )}
                  </div>
                </div>

                {/* Expandable Action Drawer */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{act.details}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Owner: {act.assignedTo}</span>
                      <button
                        onClick={(e) => toggleActionComplete(act.id, e)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 font-sans"
                      >
                        {act.completed ? "Reopen Task" : "Execute Mitigation"}
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
