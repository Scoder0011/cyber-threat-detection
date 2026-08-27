// src/components/AlertsTable.tsx
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 16.2, 17.2

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Alert } from '../types/alert';
import { getTableAlerts, sortBySeverity, sortByTimestamp } from '../utils/alertsTableUtils';
import { SeverityBadge } from './SeverityBadge';

interface AlertsTableProps {
  alerts: Alert[];
  loading?: boolean;
  error?: boolean;
  onRowClick: (alertId: string) => void;
}

type SortField = 'severity' | 'timestamp' | null;
type SortDirection = 'asc' | 'desc';

/** Chevron icon indicating sort direction */
function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return (
      <span aria-hidden="true" className="ml-1 text-gray-500 text-xs">⇅</span>
    );
  }
  return (
    <span aria-hidden="true" className="ml-1 text-cyan-400 text-xs">
      {direction === 'desc' ? '↓' : '↑'}
    </span>
  );
}

export function AlertsTable({ alerts, loading, error, onRowClick }: AlertsTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  /** Compute the displayed rows based on sort state */
  function getDisplayedAlerts(): Alert[] {
    const base = getTableAlerts(alerts); // top-20 by timestamp desc by default
    if (sortField === 'severity') {
      return sortBySeverity(base, sortDirection);
    }
    if (sortField === 'timestamp') {
      return sortByTimestamp(base, sortDirection);
    }
    return base;
  }

  function handleHeaderClick(field: SortField) {
    if (sortField === field) {
      // Toggle direction for the same field
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      // New field: default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  }

  const displayedAlerts = getDisplayedAlerts();

  /** Shared header cell button */
  function SortableHeader({
    field,
    label,
    className = '',
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) {
    const isActive = sortField === field;
    return (
      <th
        scope="col"
        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40 ${className}`}
      >
        <button
          type="button"
          onClick={() => handleHeaderClick(field)}
          className="inline-flex items-center gap-0.5 hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
          aria-label={`Sort by ${label}${isActive ? `, currently ${sortDirection}ending` : ''}`}
        >
          {label}
          <SortIcon active={isActive} direction={sortDirection} />
        </button>
      </th>
    );
  }

  return (
    // Requirement 16.2 — horizontal scroll on viewports < 1024 px
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-white/5 text-sm text-white/80">
        <thead style={{ background: "rgba(255,255,255,0.03)" }}>
          <tr>
            {/* Requirement 5.7 — clickable Severity header */}
            <SortableHeader field="severity" label="Severity" />
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Alert Type
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Source IP
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Destination IP
            </th>
            {/* Requirement 5.8 — clickable Timestamp header */}
            <SortableHeader field="timestamp" label="Timestamp" />
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {/* Requirement 5.9 — error state: do NOT render table behind error */}
          {error ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-white/40"
                role="alert"
              >
                Alert data could not be retrieved
              </td>
            </tr>
          ) : loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                <span className="animate-pulse">Loading alerts…</span>
              </td>
            </tr>
          ) : displayedAlerts.length === 0 ? (
            /* Requirement 5.6 — empty state */
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                No alerts detected
              </td>
            </tr>
          ) : (
            /* Requirement 5.5 & 17.2 — animated rows, AnimatePresence for enter/exit */
            <AnimatePresence initial={false}>
              {displayedAlerts.map((alert) => (
                <motion.tr
                  key={alert.id}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => onRowClick(alert.id)}
                  className="cursor-pointer hover:bg-white/5 focus-within:bg-white/5 transition-all duration-200"
                  tabIndex={0}
                  role="row"
                  aria-label={`Alert ${alert.id}, ${alert.severity} severity`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick(alert.id);
                    }
                  }}
                >
                  {/* Requirement 5.3 — SeverityBadge in Severity column */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{alert.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{alert.sourceIp}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{alert.destinationIp}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-white/40 text-xs">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize">{alert.status}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AlertsTable;
