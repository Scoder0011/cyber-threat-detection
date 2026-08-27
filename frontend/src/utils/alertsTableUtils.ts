// src/utils/alertsTableUtils.ts — utility functions for the Alerts Table
// Requirements: 5.1, 5.5, 5.7, 5.8

import type { Alert, Severity } from "../types/alert";

/** Severity rank map — higher rank = more severe */
const SEVERITY_RANK: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Returns the top 20 alerts ordered by timestamp descending (newest first).
 * Returns a new array — does not mutate the input.
 *
 * Validates: Requirements 5.1, 5.5
 */
export function getTableAlerts(alerts: Alert[]): Alert[] {
  return [...alerts]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 20);
}

/**
 * Sorts alerts by severity.
 *   - "desc": Critical → High → Medium → Low (most severe first)
 *   - "asc":  Low → Medium → High → Critical (least severe first)
 *
 * Returns a new array — does not mutate the input.
 *
 * Validates: Requirements 5.7
 */
export function sortBySeverity(
  alerts: Alert[],
  direction: "asc" | "desc"
): Alert[] {
  return [...alerts].sort((a, b) => {
    const rankA = SEVERITY_RANK[a.severity] ?? 0;
    const rankB = SEVERITY_RANK[b.severity] ?? 0;
    return direction === "desc" ? rankB - rankA : rankA - rankB;
  });
}

/**
 * Sorts alerts by timestamp.
 *   - "desc": newest first (ISO string descending)
 *   - "asc":  oldest first (ISO string ascending)
 *
 * Returns a new array — does not mutate the input.
 *
 * Validates: Requirements 5.8
 */
export function sortByTimestamp(
  alerts: Alert[],
  direction: "asc" | "desc"
): Alert[] {
  return [...alerts].sort((a, b) => {
    const cmp = a.timestamp.localeCompare(b.timestamp);
    return direction === "desc" ? -cmp : cmp;
  });
}
