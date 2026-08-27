// src/utils/threatClassUtils.ts — utilities for the Threat Class Chart
// Requirements: 3.2, 3.4, 3.5

import type { Alert } from "../types/alert";

/** All recognized threat categories in display order */
const THREAT_CATEGORIES = [
  "DDoS",
  "Malware",
  "Intrusion",
  "Phishing",
  "Anomaly",
] as const;

/**
 * Fixed 5-color palette mapped to each known category in order:
 *   DDoS      → #f87171 (red)
 *   Malware   → #fb923c (orange)
 *   Intrusion → #facc15 (yellow)
 *   Phishing  → #4ade80 (green)
 *   Anomaly   → #22d3ee (cyan)
 */
const PALETTE = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee"] as const;

/** Maps each known category to its fixed palette color */
const CATEGORY_COLOR_MAP: Record<string, string> = Object.fromEntries(
  THREAT_CATEGORIES.map((cat, i) => [cat, PALETTE[i]])
);

/**
 * Groups alerts by their `type` field and returns an array of
 * `{ name, count }` objects — **omitting categories with zero count**.
 *
 * Each alert is assigned to exactly one category (its `type` value).
 * Results are returned in canonical category order (DDoS, Malware, Intrusion,
 * Phishing, Anomaly), with any unknown types appended at the end.
 *
 * Validates: Requirements 3.2, 3.5 / Property 6
 */
export function groupAlertsByType(
  alerts: Alert[]
): { name: string; count: number }[] {
  const countMap = new Map<string, number>();

  for (const alert of alerts) {
    const key = alert.type;
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const result: { name: string; count: number }[] = [];

  // Known categories in canonical order first
  for (const cat of THREAT_CATEGORIES) {
    const count = countMap.get(cat);
    if (count && count > 0) {
      result.push({ name: cat, count });
      countMap.delete(cat);
    }
  }

  // Unknown category types appended afterward
  for (const [name, count] of countMap.entries()) {
    if (count > 0) {
      result.push({ name, count });
    }
  }

  return result;
}

/**
 * Returns an array of distinct hex-color strings — one per entry in
 * `categories` — with **no duplicates**.
 *
 * Known categories receive their fixed palette color. Unknown categories
 * cycle through palette colors not already claimed by known categories in
 * the input list, ensuring every returned color is unique.
 *
 * Validates: Requirements 3.4 / Property 7
 */
export function getThreatClassColors(categories: string[]): string[] {
  // Palette colors already claimed by known categories present in the input
  const usedColors = new Set<string>();
  for (const cat of categories) {
    if (CATEGORY_COLOR_MAP[cat] !== undefined) {
      usedColors.add(CATEGORY_COLOR_MAP[cat]);
    }
  }

  // Pool of palette colors available for unknown categories
  const unusedPalette = PALETTE.filter((c) => !usedColors.has(c));
  let unusedIdx = 0;

  return categories.map((cat) => {
    const fixed = CATEGORY_COLOR_MAP[cat];
    if (fixed !== undefined) {
      // Known category → its fixed color
      return fixed;
    }
    // Unknown category → cycle through unused palette colors
    const color =
      unusedPalette.length > 0
        ? unusedPalette[unusedIdx % unusedPalette.length]
        : PALETTE[unusedIdx % PALETTE.length];
    unusedIdx++;
    return color;
  });
}
