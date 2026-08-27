// src/hooks/useBotStatus.ts

import { useEffect, useRef, useState } from 'react';
import apiClient from '../api/apiClient';
import type { BotStatus, ApiError } from '../types/alert';

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000;

// ── Return type ───────────────────────────────────────────────────────────

export interface UseBotStatusReturn {
  bots: BotStatus[];
  loading: boolean;
  error: ApiError | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useBotStatus(): UseBotStatusReturn {
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const mountedRef = useRef<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchBots(): Promise<void> {
      try {
        const data = await apiClient.fetchBotStatuses();
        if (!mountedRef.current) return;
        setBots(data);
        setError(null);
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        setError(err as ApiError);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    // Fetch immediately on mount
    void fetchBots();

    // Then poll every 5 seconds
    intervalRef.current = setInterval(() => {
      void fetchBots();
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { bots, loading, error };
}
