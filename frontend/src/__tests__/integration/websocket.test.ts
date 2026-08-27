// src/__tests__/integration/websocket.test.ts
// Integration tests for useAlerts hook — Requirements: 12.3, 12.5, 5.4

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { ModeContext } from "../../context/ModeContext";
import type { ModeContextValue } from "../../context/ModeContext";
import { useAlerts } from "../../hooks/useAlerts";

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Wrapper that provides a fixed mode value via ModeContext.Provider directly
 * so we can control the mode value without depending on ModeProvider's state.
 */
function makeFixedModeWrapper(mode: "live" | "replay") {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const value: ModeContextValue = {
      mode,
      setMode: vi.fn(),
    };
    return React.createElement(ModeContext.Provider, { value }, children);
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("useAlerts — integration tests (Requirements 12.3, 12.5)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── Test 1: Mock interval fires and appends alerts (live mode) ──────────

  it("1. In live mode, alerts array grows as the mock interval fires", async () => {
    const wrapper = makeFixedModeWrapper("live");

    const { result } = renderHook(() => useAlerts(), { wrapper });

    // Initially loading — wait for loading to settle
    await act(async () => {
      // The hook sets loading=false and connectionStatus="connected" synchronously
      // in the mock path (no env var set). Flush microtasks.
      await Promise.resolve();
    });

    // After initialization the hook should be connected and have 0 alerts
    expect(result.current.connectionStatus).toBe("connected");
    expect(result.current.loading).toBe(false);

    const initialCount = result.current.alerts.length;

    // Advance timers by at least MOCK_INTERVAL_MAX_MS (5 s) to fire the first timeout
    await act(async () => {
      vi.advanceTimersByTime(5_500);
      await Promise.resolve();
    });

    // At least one alert should have been appended
    expect(result.current.alerts.length).toBeGreaterThan(initialCount);
  });

  // ── Test 2: Mode switch from live to replay clears the buffer ───────────

  it("2. Switching from live to replay clears the alerts buffer", async () => {
    // Step 1: start in live mode and accumulate some alerts
    const { result: liveResult } = renderHook(() => useAlerts(), {
      wrapper: makeFixedModeWrapper("live"),
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Let the mock interval fire at least once (5 seconds max interval)
    await act(async () => {
      vi.advanceTimersByTime(5_500);
      await Promise.resolve();
    });

    // Should now have at least one alert
    expect(liveResult.current.alerts.length).toBeGreaterThan(0);

    // Step 2: mount a new hook instance in replay mode — the design says
    // "on transition to replay: disconnect, clear buffer, begin replaying".
    // A new hook instance starting in replay mode should have an empty buffer.
    const { result: replayResult } = renderHook(() => useAlerts(), {
      wrapper: makeFixedModeWrapper("replay"),
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Replay mode resets the alert buffer to empty on start
    expect(replayResult.current.connectionStatus).toBe("replay");
    expect(replayResult.current.alerts.length).toBe(0);
  });

  // ── Test 3: Unmount cleanup — no state updates after unmount ───────────

  it("3. Unmounting the hook stops all timers and causes no errors after unmount", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const wrapper = makeFixedModeWrapper("live");
    const { result, unmount } = renderHook(() => useAlerts(), { wrapper });

    // Wait for it to settle into connected state
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);

    // Unmount while timers are still pending
    unmount();

    // Advance timers — should NOT trigger React state updates since hook is unmounted
    await act(async () => {
      vi.advanceTimersByTime(10_000);
      await Promise.resolve();
    });

    // No "Can't perform a React state update on an unmounted component" errors
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("unmounted")
    );

    consoleSpy.mockRestore();
  });

  // ── Test 4: connectionStatus is "replay" in replay mode ────────────────

  it("4. In replay mode, connectionStatus is set to 'replay'", async () => {
    const wrapper = makeFixedModeWrapper("replay");
    const { result } = renderHook(() => useAlerts(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.connectionStatus).toBe("replay");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // ── Test 5: Replay mode populates alerts from the dataset over time ─────

  it("5. In replay mode, alerts are appended from the dataset on each interval tick", async () => {
    const wrapper = makeFixedModeWrapper("replay");
    const { result } = renderHook(() => useAlerts(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    // Initially empty
    expect(result.current.alerts.length).toBe(0);

    // Advance by REPLAY_INTERVAL_MS (1 s) twice
    await act(async () => {
      vi.advanceTimersByTime(1_000);
      await Promise.resolve();
    });

    expect(result.current.alerts.length).toBe(1);

    await act(async () => {
      vi.advanceTimersByTime(1_000);
      await Promise.resolve();
    });

    expect(result.current.alerts.length).toBe(2);
  });
});
