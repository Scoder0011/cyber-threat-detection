// src/hooks/useThroughput.ts

import { useEffect, useRef, useState } from 'react';
import apiClient from '../api/apiClient';
import type { ThroughputPoint, ApiError } from '../types/alert';

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000;
const BUFFER_CAP = 60;

// ── Return type ───────────────────────────────────────────────────────────

export interface UseThroughputReturn {
  points: ThroughputPoint[];
  loading: boolean;
  error: ApiError | null;
}

// ── Validation ────────────────────────────────────────────────────────────

/**
 * Returns true only when `point.value` is a finite number.
 * Discards NaN, Infinity, null, undefined, and non-number types.
 * Requirements 4.7
 */
function isValidPoint(point: ThroughputPoint): boolean {
  return typeof point.value === 'number' && Number.isFinite(point.value);
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useThroughput(): UseThroughputReturn {
  const [points, setPoints] = useState<ThroughputPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const mountedRef = useRef<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    async function poll() {
      try {
        const fetched = await apiClient.fetchThroughput();

        if (!mountedRef.current) return;

        // Validate each point — discard non-finite numeric values (Req 4.7)
        const valid = fetched.filter(isValidPoint);

        setPoints((prev) => {
          // Append valid points and keep only the last 60 (Req 4.2, 4.3)
          const combined = [...prev, ...valid];
          return combined.slice(-BUFFER_CAP);
        });

        setLoading(false);
        setError(null);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        // Store the typed ApiError (or wrap an unknown error)
        const apiError: ApiError =
          err !== null &&
          typeof err === 'object' &&
          'statusCode' in err &&
          'message' in err &&
          'kind' in err
            ? (err as ApiError)
            : {
                statusCode: 0,
                message: err instanceof Error ? err.message : 'Unknown error',
                kind: 'network',
              };
        setError(apiError);
        setLoading(false);
      }
    }

    // Initial fetch immediately
    poll();

    // Then poll every 5 seconds
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { points, loading, error };
}
