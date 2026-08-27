// src/__tests__/property/evidence.property.test.ts
// Feature: cyber-threat-dashboard
// Property 16: Evidence panel renders all flow fields (Requirements 8.1)
// Property 17: Evidence panel accordion allows at most one open row (Requirements 8.3, 8.4)

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { EvidencePanel } from '../../components/EvidencePanel';
import { flowArbitrary, rawPacketArbitrary } from '../arbitraries';
import type { Evidence } from '../../types/alert';

describe('EvidencePanel Property Tests', () => {
  it('Property 16: renders all flow rows when flows are present', () => {
    fc.assert(
      fc.property(
        fc.array(flowArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(rawPacketArbitrary, { maxLength: 5 }),
        (flows, rawPackets) => {
          const evidence: Evidence = { flows, rawPackets };
          const { container, unmount } = render(React.createElement(EvidencePanel, { evidence }));

          const buttons = container.querySelectorAll('button[aria-expanded]');
          expect(buttons.length).toBe(flows.length);

          unmount();
        }
      )
    );
  });

  it('Property 17: accordion allows at most one expanded row at a time and toggles off', () => {
    fc.assert(
      fc.property(
        fc.array(flowArbitrary, { minLength: 2, maxLength: 4 }),
        (flows) => {
          const evidence: Evidence = { flows, rawPackets: [] };
          const { container, unmount } = render(React.createElement(EvidencePanel, { evidence }));

          const buttons = container.querySelectorAll('button[aria-expanded]');

          // Expand row 0
          fireEvent.click(buttons[0]);
          expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
          expect(buttons[1].getAttribute('aria-expanded')).toBe('false');

          // Click row 1 -> row 0 should collapse, row 1 should expand
          fireEvent.click(buttons[1]);
          expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
          expect(buttons[1].getAttribute('aria-expanded')).toBe('true');

          // Click row 1 again -> row 1 collapses
          fireEvent.click(buttons[1]);
          expect(buttons[1].getAttribute('aria-expanded')).toBe('false');

          unmount();
        }
      )
    );
  });
});
