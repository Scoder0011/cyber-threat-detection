// src/utils/kpiUtils.ts — KPI computation utilities for the dashboard

import type { Alert, BotStatus, ThroughputPoint } from "../types/alert";

/**
 * Returns the total number of alerts.
 * Returns 0 for an empty array.
 */
export function computeTotalAlerts(alerts: Alert[]): number {
  return alerts.length;
}

/**
 * Returns the count of alerts with severity "Critical".
 * Returns 0 for an empty array.
 */
export function computeCriticalAlerts(alerts: Alert[]): number {
  return alerts.filter((a) => a.severity === "Critical").length;
}

/**
 * Returns the count of bots whose status is "active".
 * Returns 0 for an empty array.
 */
export function computeActiveBots(bots: BotStatus[]): number {
  return bots.filter((b) => b.status === "active").length;
}

/**
 * Returns the value of the most recent ThroughputPoint (last element).
 * Returns 0 for an empty array.
 */
export function computeCurrentThroughput(points: ThroughputPoint[]): number {
  return points[points.length - 1]?.value ?? 0;
}
