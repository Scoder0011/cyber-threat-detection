// src/api/supabaseClient.ts
// Direct Supabase Integration for Deployed Database and Realtime Threat Streaming

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Alert, BotStatus, Severity, AlertStatus } from '../types/alert';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Maps a Supabase threat_alerts database row to our TypeScript Alert model.
 */
export function mapSupabaseAlert(row: Record<string, any>): Alert {
  const sevRaw = (row.severity || 'MEDIUM').toUpperCase();
  let severity: Severity = 'Medium';
  if (sevRaw === 'CRITICAL') severity = 'Critical';
  else if (sevRaw === 'HIGH') severity = 'High';
  else if (sevRaw === 'LOW') severity = 'Low';

  const statusRaw = (row.status || 'NEW').toLowerCase();
  let status: AlertStatus = 'open';
  if (statusRaw === 'investigating') status = 'investigating';
  else if (statusRaw === 'resolved') status = 'resolved';

  return {
    id: row.alert_id || row.id,
    type: row.attack_type || row.title || 'Threat',
    severity,
    sourceIp: row.source_ip || '0.0.0.0',
    destinationIp: row.target_ip || '0.0.0.0',
    targetPort: row.target_port ?? undefined,
    protocol: row.protocol || 'TCP',
    timestamp: row.created_at || new Date().toISOString(),
    description: row.description || row.title || 'Security alert',
    status,
    confidenceScore: row.confidence_score ? Number(row.confidence_score) : 0.95,
    contributingBots: Array.isArray(row.contributing_bots) ? row.contributing_bots : [],
    botScores: row.bot_scores || {},
    blockchainHash: row.blockchain_tx_hash || null,
    blockchainVerified: Boolean(row.blockchain_verified),
    blockchainTxHash: row.blockchain_tx_hash || null,
    blockchainBlockNum: row.blockchain_block_num ? Number(row.blockchain_block_num) : null,
    evidence: row.evidence || { flows: [], rawPackets: [] },
  };
}

/**
 * Maps a Supabase bot_metrics row to our BotStatus model.
 */
export function mapSupabaseBot(row: Record<string, any>): BotStatus {
  const statusRaw = (row.status || 'HEALTHY').toUpperCase();
  let status: 'active' | 'idle' | 'error' = 'active';
  if (statusRaw === 'OFFLINE' || statusRaw === 'DEGRADED') status = 'error';
  else if (statusRaw === 'INITIALIZING') status = 'idle';

  return {
    id: row.id || row.bot_name,
    name: row.display_name || row.bot_name,
    status,
    detectionCount: Number(row.threats_detected ?? row.predictions_count ?? 0),
    lastActive: row.last_heartbeat ? new Date(row.last_heartbeat).toLocaleTimeString() : 'Just now',
    latencyMs: row.latency_ms ? Number(row.latency_ms) : undefined,
    cpuPercent: row.cpu_percent ? Number(row.cpu_percent) : undefined,
    memoryMb: row.memory_mb ? Number(row.memory_mb) : undefined,
    accuracyScore: row.accuracy_score ? Number(row.accuracy_score) : undefined,
    errorMessage: row.error_message || null,
  };
}

/**
 * Fetch all alerts from Supabase.
 */
export async function fetchSupabaseAlerts(): Promise<Alert[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('threat_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[Supabase] Error fetching alerts:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseAlert);
}

/**
 * Fetch bot statuses from Supabase.
 */
export async function fetchSupabaseBotStatuses(): Promise<BotStatus[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bot_metrics')
    .select('*')
    .order('bot_name', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching bot metrics:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseBot);
}

/**
 * Subscribe to realtime threat alert inserts from Supabase.
 */
export function subscribeToSupabaseAlerts(onNewAlert: (alert: Alert) => void): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('threat-alerts-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'threat_alerts' },
      (payload) => {
        if (payload.new) {
          onNewAlert(mapSupabaseAlert(payload.new));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
