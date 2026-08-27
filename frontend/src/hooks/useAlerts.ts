import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThreatAlert, NetworkFlow, BotMetric, SeverityLevel, AttackType, ThroughputDataPoint } from '../types/alert';
import { api, MOCK_ALERTS, MOCK_BOTS } from '../api/client';

export function useAlerts() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>(MOCK_ALERTS);
  const [flows, setFlows] = useState<NetworkFlow[]>([]);
  const [bots, setBots] = useState<BotMetric[]>(MOCK_BOTS);
  const [throughputHistory, setThroughputHistory] = useState<ThroughputDataPoint[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [mode, setMode] = useState<'LIVE' | 'REPLAY'>('LIVE');

  // Load initial alerts & bot metrics
  const loadInitialData = useCallback(async () => {
    const fetchedAlerts = await api.getAlerts();
    if (fetchedAlerts.length > 0) setAlerts(fetchedAlerts);

    const fetchedBots = await api.getBotHealth();
    if (fetchedBots.length > 0) setBots(fetchedBots);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Real-time Throughput Generator (Simulating high-speed flow metrics)
  useEffect(() => {
    // Generate initial history
    const initialPoints: ThroughputDataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 1000);
      initialPoints.push({
        timestamp: t.toISOString(),
        timeLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        flowsPerSec: Math.floor(3200 + Math.sin(i * 0.5) * 600 + Math.random() * 400),
        packetsPerSec: Math.floor(18000 + Math.random() * 5000),
        bandwidthMbps: Number((45.2 + Math.random() * 12).toFixed(1)),
      });
    }
    setThroughputHistory(initialPoints);

    const interval = setInterval(() => {
      const t = new Date();
      const newPoint: ThroughputDataPoint = {
        timestamp: t.toISOString(),
        timeLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        flowsPerSec: Math.floor(3400 + Math.random() * 800),
        packetsPerSec: Math.floor(19000 + Math.random() * 6000),
        bandwidthMbps: Number((48.0 + Math.random() * 15).toFixed(1)),
      };

      setThroughputHistory((prev) => [...prev.slice(1), newPoint]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter alerts by search and severity
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        alert.title.toLowerCase().includes(q) ||
        alert.attack_type.toLowerCase().includes(q) ||
        alert.source_ip.toLowerCase().includes(q) ||
        alert.target_ip.toLowerCase().includes(q);

      return matchesSeverity && matchesSearch;
    });
  }, [alerts, selectedSeverity, searchQuery]);

  // Add new alert dynamically (e.g. from simulation or live WebSocket)
  const addAlert = useCallback((newAlert: ThreatAlert) => {
    setAlerts((prev) => [newAlert, ...prev.filter((a) => a.alert_id !== newAlert.alert_id)]);
  }, []);

  // Dismiss / resolve alert
  const updateAlertStatus = useCallback((alertId: string, newStatus: ThreatAlert['status']) => {
    setAlerts((prev) =>
      prev.map((a) => (a.alert_id === alertId ? { ...a, status: newStatus } : a))
    );
  }, []);

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    bots,
    flows,
    throughputHistory,
    selectedSeverity,
    setSelectedSeverity,
    searchQuery,
    setSearchQuery,
    isConnected,
    mode,
    setMode,
    addAlert,
    updateAlertStatus,
    refreshData: loadInitialData,
  };
}
