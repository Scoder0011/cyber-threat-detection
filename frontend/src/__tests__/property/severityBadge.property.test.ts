// src/__tests__/property/severityBadge.property.test.ts
// Feature: cyber-threat-dashboard
// Property 14: Severity badge color is always correct (Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7)

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import React from 'react';
import { render } from '@testing-library/react';
import { SeverityBadge } from '../../components/SeverityBadge';
import { severityArbitrary } from '../arbitraries';

const EXPECTED_CLASSES = {
  Critical: 'bg-red-600',
  High: 'bg-orange-500',
  Medium: 'bg-amber-400',
  Low: 'bg-emerald-500',
};

describe('SeverityBadge Property Tests', () => {
  it('Property 14: renders correct Tailwind background class for each severity level', () => {
    fc.assert(
      fc.property(severityArbitrary, (severity) => {
        const { container, unmount } = render(React.createElement(SeverityBadge, { severity }));
        const badge = container.querySelector('span');
        expect(badge).not.toBeNull();
        expect(badge?.className).toContain(EXPECTED_CLASSES[severity]);
        expect(badge?.textContent).toBe(severity);
        unmount();
      })
    );
  });

  it('Property 14: returns null for null, undefined, or empty strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined, ''),
        (val) => {
          const { container, unmount } = render(React.createElement(SeverityBadge, { severity: val }));
          expect(container.firstChild).toBeNull();
          unmount();
        }
      )
    );
  });
});
