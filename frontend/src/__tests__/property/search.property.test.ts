// src/__tests__/property/search.property.test.ts
// Feature: cyber-threat-dashboard
// Property 1: Search filters by query string (Requirements 1.8)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import useSearch from '../../hooks/useSearch';
import { alertArbitrary } from '../arbitraries';

describe('Search Property Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Property 1: filteredAlerts matches query across id, type, sourceIp, destinationIp, or description', () => {
    fc.assert(
      fc.property(
        fc.array(alertArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (alerts, query) => {
          const { result, unmount } = renderHook(({ a, q }) => useSearch(a, q), {
            initialProps: { a: alerts, q: query },
          });

          // Advance fake timer by 300ms debounce
          act(() => {
            vi.advanceTimersByTime(300);
          });

          const qLower = query.toLowerCase();
          const { filteredAlerts } = result.current;

          for (const alert of filteredAlerts) {
            const matches =
              alert.id.toLowerCase().includes(qLower) ||
              alert.type.toLowerCase().includes(qLower) ||
              alert.sourceIp.toLowerCase().includes(qLower) ||
              alert.destinationIp.toLowerCase().includes(qLower) ||
              alert.description.toLowerCase().includes(qLower);
            expect(matches).toBe(true);
          }

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  });
});
