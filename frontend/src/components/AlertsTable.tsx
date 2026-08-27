// src/components/AlertsTable.tsx
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 16.2, 17.2

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ArrowUpRight } from 'lucide-react';
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

interface SortableHeaderProps {
  field: SortField;
  label: string;
  active: boolean;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHeader({
  field,
  label,
  active,
  direction,
  onSort,
  className = '',
}: SortableHeaderProps) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-0.5 hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded cursor-pointer"
        aria-label={`Sort by ${label}${active ? `, currently ${direction}ending` : ''}`}
      >
        {label}
        <SortIcon active={active} direction={direction} />
      </button>
    </th>
  );
}

export function AlertsTable({ alerts, loading, error, onRowClick }: AlertsTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  /** Compute the displayed rows based on sort and filter state */
  function getDisplayedAlerts(): Alert[] {
    let filtered = alerts;
    if (selectedSeverity !== 'ALL') {
      filtered = alerts.filter(
        (a) => a.severity.toUpperCase() === selectedSeverity.toUpperCase()
      );
    }

    const base = getTableAlerts(filtered); // top-20 by timestamp desc by default
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
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }

  const displayedAlerts = getDisplayedAlerts();

  return (
    <div className="w-full">
      {/* Table Controls Bar */}
      <div className="p-4 bg-slate-950/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Live Stream
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            ({displayedAlerts.length} displayed)
          </span>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-800 text-[11px] font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Requirement 16.2 — horizontal scroll on viewports < 1024 px */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-white/5 text-sm text-white/80 font-mono">
          <thead style={{ background: "rgba(255,255,255,0.03)" }}>
            <tr>
              {/* Requirement 5.7 — clickable Severity header */}
              <SortableHeader
                field="severity"
                label="Severity"
                active={sortField === 'severity'}
                direction={sortDirection}
                onSort={handleHeaderClick}
              />
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
              <SortableHeader
                field="timestamp"
                label="Timestamp"
                active={sortField === 'timestamp'}
                direction={sortDirection}
                onSort={handleHeaderClick}
              />
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* Requirement 5.9 — error state: do NOT render table behind error */}
            {error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-white/40"
                  role="alert"
                >
                  Alert data could not be retrieved
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                  <span className="animate-pulse">Loading alerts…</span>
                </td>
              </tr>
            ) : displayedAlerts.length === 0 ? (
              /* Requirement 5.6 — empty state */
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/30">
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
                    className="cursor-pointer hover:bg-white/5 focus-within:bg-white/5 transition-all duration-200 group"
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {alert.type}
                      </div>
                      {alert.confidenceScore !== undefined && (
                        <div className="text-[10px] text-gray-400">
                          {(alert.confidenceScore * 100).toFixed(0)}% conf
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-red-400 font-semibold">
                      {alert.sourceIp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-cyan-400">
                      {alert.destinationIp}
                      {alert.targetPort ? `:${alert.targetPort}` : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white/40 text-xs">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          alert.status === 'open'
                            ? 'bg-red-900/60 text-red-300 border border-red-500/30'
                            : alert.status === 'investigating'
                            ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {alert.status}
                        </span>
                        {alert.blockchainVerified && (
                          <span
                            className="hidden sm:inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            title="On-Chain Verified"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-purple-400" />
                            Proof
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(alert.id);
                        }}
                        className="p-1 rounded bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-gray-300 transition-colors cursor-pointer"
                        title="View Forensic Evidence"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AlertsTable;
