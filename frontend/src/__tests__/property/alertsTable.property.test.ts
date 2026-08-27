// src/__tests__/property/alertsTable.property.test.ts
// Feature: cyber-threat-dashboard
// Property 11: Alerts table shows most recent 20, newest first (Requirements 5.1, 5.5)
// Property 12: Alerts table severity sort is total and correct (Requirements 5.7)
// Property 13: Alerts table timestamp sort preserves order (Requirements 5.8)

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { alertArbitrary } from '../arbitraries';
import { getTableAlerts, sortBySeverity, sortByTimestamp } from '../../utils/alertsTableUtils';
import type { Severity } from '../../types/alert';

const SEVERITY_RANK: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

describe('AlertsTable Property Tests', () => {
  it('Property 11: getTableAlerts returns at most 20 items, sorted newest first', () => {
    fc.assert(
      fc.property(fc.array(alertArbitrary, { maxLength: 100 }), (alerts) => {
        const result = getTableAlerts(alerts);
        expect(result.length).toBeLessThanOrEqual(20);
        expect(result.length).toBe(Math.min(alerts.length, 20));

        // Check descending timestamp order
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].timestamp.localeCompare(result[i + 1].timestamp)).toBeGreaterThanOrEqual(0);
        }
      })
    );
  });

  it('Property 12: sortBySeverity correctly sorts by severity rank asc and desc', () => {
    fc.assert(
      fc.property(fc.array(alertArbitrary), (alerts) => {
        const desc = sortBySeverity(alerts, 'desc');
        const asc = sortBySeverity(alerts, 'asc');

        expect(desc.length).toBe(alerts.length);
        expect(asc.length).toBe(alerts.length);

        for (let i = 0; i < desc.length - 1; i++) {
          expect(SEVERITY_RANK[desc[i].severity]).toBeGreaterThanOrEqual(SEVERITY_RANK[desc[i + 1].severity]);
        }

        for (let i = 0; i < asc.length - 1; i++) {
          expect(SEVERITY_RANK[asc[i].severity]).toBeLessThanOrEqual(SEVERITY_RANK[asc[i + 1].severity]);
        }
      })
    );
  });

  it('Property 13: sortByTimestamp preserves total ordering for timestamps', () => {
    fc.assert(
      fc.property(fc.array(alertArbitrary), (alerts) => {
        const desc = sortByTimestamp(alerts, 'desc');
        const asc = sortByTimestamp(alerts, 'asc');

        for (let i = 0; i < desc.length - 1; i++) {
          expect(desc[i].timestamp.localeCompare(desc[i + 1].timestamp)).toBeGreaterThanOrEqual(0);
        }

        for (let i = 0; i < asc.length - 1; i++) {
          expect(asc[i].timestamp.localeCompare(asc[i + 1].timestamp)).toBeLessThanOrEqual(0);
        }
      })
    );
  });
});
