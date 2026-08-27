// src/__tests__/property/apiClient.property.test.ts
// Feature: cyber-threat-dashboard
// Property 23: Mock API client is deterministic (Requirements 13.2)
// Property 24: API client throws typed errors for non-2xx responses (Requirements 13.5, 13.6)

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { createApiClient } from '../../api/apiClient';
import type { ApiError } from '../../types/alert';

describe('ApiClient Property Tests', () => {
  it('Property 23: mock API client returns deterministic data on repeated calls', async () => {
    const client = createApiClient(true);

    const [alerts1, alerts2] = await Promise.all([client.fetchAlerts(), client.fetchAlerts()]);
    expect(alerts1).toEqual(alerts2);

    const [bots1, bots2] = await Promise.all([client.fetchBotStatuses(), client.fetchBotStatuses()]);
    expect(bots1).toEqual(bots2);

    const [tp1, tp2] = await Promise.all([client.fetchThroughput(), client.fetchThroughput()]);
    expect(tp1).toEqual(tp2);

    const [sys1, sys2] = await Promise.all([client.fetchSystemMetrics(), client.fetchSystemMetrics()]);
    expect(sys1).toEqual(sys2);
  });

  it('Property 24: throws typed 404 ApiError when alert ID is not found in mock client', async () => {
    const client = createApiClient(true);

    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z0-9-]{10,20}$/).filter((id) => !id.startsWith('alert-00')),
        async (unknownId) => {
          try {
            await client.fetchAlert(unknownId);
            expect.unreachable('Should have thrown an error');
          } catch (err: unknown) {
            const apiError = err as ApiError;
            expect(apiError.statusCode).toBe(404);
            expect(apiError.kind).toBe('http');
            expect(apiError.message).toContain(unknownId);
          }
        }
      )
    );
  });
});
