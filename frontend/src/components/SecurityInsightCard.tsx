// src/components/SecurityInsightCard.tsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight, Check, ShieldAlert } from 'lucide-react';
import type { Alert } from '../types/alert';

interface SecurityInsightCardProps {
  alerts?: Alert[];
}

interface ActionItem {
  id: string;
  title: string;
  completed: boolean;
}

export function SecurityInsightCard({ alerts = [] }: SecurityInsightCardProps) {
  // Derive dynamic security insight narrative from actual live alerts
  const insight = useMemo(() => {
    if (!alerts || alerts.length === 0) {
      return {
        hasThreats: false,
        summary: 'No active threat anomalies detected. AI surveillance bots report all network perimeters and system nodes healthy.',
      };
    }

    // Find top threat type
    const counts: Record<string, number> = {};
    for (const a of alerts) {
      counts[a.type] = (counts[a.type] || 0) + 1;
    }
    const sortedTypes = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topType = sortedTypes[0]?.[0] || 'Malicious';
    const topCount = sortedTypes[0]?.[1] || 0;
    const topPct = Math.round((topCount / alerts.length) * 100);

    const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;

    return {
      hasThreats: true,
      topType,
      topPct,
      criticalCount,
      summary: `${topType} represents ${topPct}% of recent anomalies (${topCount} occurrences). ${
        criticalCount > 0
          ? `${criticalCount} critical incidents require immediate triage.`
          : 'Threat vectors are contained under active telemetry monitoring.'
      }`,
    };
  }, [alerts]);

  // Derive dynamic recommended actions from actual alerts
  const dynamicActions = useMemo<ActionItem[]>(() => {
    if (!alerts || alerts.length === 0) {
      return [
        { id: 'act-1', title: 'Verify telemetry feed status', completed: true },
        { id: 'act-2', title: 'Maintain active bot surveillance', completed: true },
      ];
    }

    const items: ActionItem[] = [];
    const criticalAlert = alerts.find((a) => a.severity === 'Critical');
    if (criticalAlert) {
      items.push({
        id: `act-${criticalAlert.id}`,
        title: `Investigate ${criticalAlert.id} (${criticalAlert.type})`,
        completed: false,
      });
    }

    const highAlert = alerts.find((a) => a.severity === 'High' && a.id !== criticalAlert?.id);
    if (highAlert) {
      items.push({
        id: `act-${highAlert.id}`,
        title: `Review flow vectors for ${highAlert.sourceIp}`,
        completed: false,
      });
    }

    if (items.length < 3) {
      items.push({
        id: 'act-patch',
        title: `Audit destination ports (${new Set(alerts.map((a) => a.targetPort || a.destinationIp)).size} endpoints)`,
        completed: false,
      });
    }

    return items.slice(0, 3);
  }, [alerts]);

  const [actions, setActions] = useState<Record<string, boolean>>({});

  const toggleAction = (id: string) => {
    setActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Top Banner: Soft Gradient with Dynamic Security Insight */}
      <div className="threatlens-insight-banner rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {insight.hasThreats ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          </div>
          <h3 className="text-xs font-bold tracking-tight text-slate-900">Security Insight</h3>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {insight.summary}
        </p>
      </div>

      {/* Bottom Section: Dynamic Recommended Actions */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recommended Actions
          </span>
          {/* Progress Indicators */}
          <div className="flex items-center gap-1">
            <div className="w-6 h-1 rounded-full bg-slate-900" />
            <div className="w-6 h-1 rounded-full bg-slate-200" />
            <div className="w-6 h-1 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-2">
          {dynamicActions.map((action) => {
            const isCompleted = actions[action.id] ?? action.completed;
            return (
              <motion.div
                key={action.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleAction(action.id)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <span className="text-xs font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate pr-2">
                  {action.title}
                </span>

                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full text-slate-400 flex items-center justify-center shrink-0 group-hover:text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SecurityInsightCard;
