// src/components/SecurityInsightCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight, Check } from 'lucide-react';

interface RecommendedAction {
  id: string;
  title: string;
  completed: boolean;
}

const DEFAULT_ACTIONS: RecommendedAction[] = [
  { id: 'act-1', title: 'Investigate INC-2024-0519 (Ransomware)', completed: true },
  { id: 'act-2', title: 'Review suspicious email campaigns', completed: false },
  { id: 'act-3', title: 'Apply pending critical patches (12)', completed: false },
];

export function SecurityInsightCard() {
  const [actions, setActions] = useState<RecommendedAction[]>(DEFAULT_ACTIONS);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Top Banner: Soft Gradient with Security Insight */}
      <div className="threatlens-insight-banner rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold tracking-tight text-slate-900">Security Insight</h3>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Ransomware activity <strong className="text-slate-900 font-bold">increased 32%</strong> in the last 24 hours. Most attacks target <em className="italic">Finance</em> and <em className="italic">Engineering</em> systems via phishing emails with malicious attachments.
        </p>
      </div>

      {/* Bottom Section: Recommended Actions */}
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
          {actions.map((action) => (
            <motion.div
              key={action.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAction(action.id)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <span className="text-xs font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                {action.title}
              </span>

              {action.completed ? (
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full text-slate-400 flex items-center justify-center shrink-0 group-hover:text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SecurityInsightCard;
