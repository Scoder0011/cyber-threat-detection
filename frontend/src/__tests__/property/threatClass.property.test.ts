// src/__tests__/property/threatClass.property.test.ts
// Feature: cyber-threat-dashboard
// Property 6: Threat class grouping is exhaustive and accurate (Requirements 3.2, 3.5)
// Property 7: Threat class colors are always distinct (Requirements 3.4)

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { alertArbitrary } from '../arbitraries';
import { groupAlertsByType, getThreatClassColors } from '../../utils/threatClassUtils';

describe('ThreatClass Property Tests', () => {
  it('Property 6: groupAlertsByType sum of counts equals input alerts length and has no zero counts', () => {
    fc.assert(
      fc.property(fc.array(alertArbitrary), (alerts) => {
        const grouped = groupAlertsByType(alerts);

        // Sum of counts matches total alerts count
        const totalCount = grouped.reduce((sum, g) => sum + g.count, 0);
        expect(totalCount).toBe(alerts.length);

        // No zero-count categories present
        for (const g of grouped) {
          expect(g.count).toBeGreaterThan(0);
        }
      })
    );
  });

  it('Property 7: getThreatClassColors returns distinct color per category', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
        (categories) => {
          const colors = getThreatClassColors(categories);
          expect(colors.length).toBe(categories.length);

          const uniqueColors = new Set(colors);
          expect(uniqueColors.size).toBe(categories.length);
        }
      )
    );
  });
});
