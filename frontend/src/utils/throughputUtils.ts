// src/utils/throughputUtils.ts
import { format, parseISO } from "date-fns";
import type { ThroughputPoint } from "../types/alert";

/**
 * Formats an ISO-8601 timestamp string as HH:mm:ss.
 * Requirements: 4.4
 */
export function formatTimestamp(ts: string): string {
  return format(parseISO(ts), "HH:mm:ss");
}

/**
 * Appends a new ThroughputPoint to the buffer, enforcing a 60-point cap.
 *
 * - If `point.value` is null, undefined, NaN, or not a number, the point is
 *   discarded and the original buffer is returned unchanged.
 * - Otherwise a new array is returned containing the existing buffer plus the
 *   new point, trimmed from the front if it exceeds 60 entries.
 * - The input buffer is never mutated.
 *
 * Requirements: 4.2, 4.3, 4.7
 */
export function appendThroughputPoint(
  buffer: ThroughputPoint[],
  point: ThroughputPoint
): ThroughputPoint[] {
  // Discard invalid values: null, undefined, NaN, or non-numeric
  if (point.value === null || point.value === undefined || typeof point.value !== "number" || isNaN(point.value)) {
    return buffer;
  }

  const next = [...buffer, point];

  // Enforce 60-point cap — drop oldest entries from the front
  if (next.length > 60) {
    return next.slice(next.length - 60);
  }

  return next;
}
