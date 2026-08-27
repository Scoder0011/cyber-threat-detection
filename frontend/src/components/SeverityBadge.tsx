// src/components/SeverityBadge.tsx

import type { Severity } from '../types/alert';

interface SeverityBadgeProps {
  severity: Severity | string | null | undefined;
}

const colorMap: Record<string, string> = {
  Critical: 'bg-red-600 text-white',
  High: 'bg-orange-500 text-white',
  Medium: 'bg-amber-400 text-black',
  Low: 'bg-emerald-500 text-white',
};

const FALLBACK_CLASS = 'bg-gray-500 text-white';

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  if (severity === null || severity === undefined || severity === '') {
    return null;
  }

  const colorClass = colorMap[severity] ?? FALLBACK_CLASS;

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}
      aria-label={`Severity: ${severity}`}
    >
      {severity}
    </span>
  );
}

export default SeverityBadge;
