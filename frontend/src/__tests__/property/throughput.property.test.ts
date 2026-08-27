// src/__tests__/property/throughput.property.test.ts
// Feature: cyber-threat-dashboard
// Property 8: Throughput window never exceeds 60 points (Requirements 4.2, 4.3)
// Property 9: Timestamp formatter produces HH:mm:ss strings (Requirements 4.4)
// Property 10: Invalid throughput data points are discarded (Requirements 4.7)

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { throughputPointArbitrary, isoTimestampArbitrary } from '../arbitraries';
import { appendThroughputPoint, formatTimestamp } from '../../utils/throughputUtils';
import type { ThroughputPoint } from '../../types/alert';

describe('Throughput Property Tests', () => {
  it('Property 8: buffer length never exceeds 60 after append', () => {
    fc.assert(
      fc.property(
        fc.array(throughputPointArbitrary, { maxLength: 80 }),
        throughputPointArbitrary,
        (buffer, newPoint) => {
          const result = appendThroughputPoint(buffer, newPoint);
          expect(result.length).toBeLessThanOrEqual(60);
          expect(result[result.length - 1]).toEqual(newPoint);
        }
      )
    );
  });

  it('Property 9: formatTimestamp produces valid HH:mm:ss format', () => {
    fc.assert(
      fc.property(isoTimestampArbitrary, (ts) => {
        const formatted = formatTimestamp(ts);
        expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      })
    );
  });

  it('Property 10: invalid or NaN points are discarded without modifying buffer', () => {
    fc.assert(
      fc.property(
        fc.array(throughputPointArbitrary, { maxLength: 20 }),
        fc.constantFrom(NaN, null as unknown as number, undefined as unknown as number, 'invalid' as unknown as number),
        (buffer, badVal) => {
          const invalidPoint = {
            timestamp: new Date().toISOString(),
            value: badVal,
            unit: 'Mbps' as const,
          };
          const result = appendThroughputPoint(buffer, invalidPoint as ThroughputPoint);
          expect(result).toBe(buffer);
        }
      )
    );
  });
});
