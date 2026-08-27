// src/__tests__/arbitraries.ts — shared fast-check arbitraries for property-based tests

import * as fc from 'fast-check';
import type { Alert, BotStatus, Flow, RawPacket, ThroughputPoint } from '../types/alert';

// ── Primitive arbitraries ──────────────────────────────────────────────────

export const severityArbitrary = fc.constantFrom(
  'Critical' as const,
  'High' as const,
  'Medium' as const,
  'Low' as const,
);

export const alertStatusArbitrary = fc.constantFrom(
  'open' as const,
  'investigating' as const,
  'resolved' as const,
);

export const botStatusValueArbitrary = fc.constantFrom(
  'active' as const,
  'idle' as const,
  'error' as const,
);

// Use integer epoch ms within a safe range to avoid RangeError during fast-check shrinking
const MIN_EPOCH_MS = new Date('2000-01-01T00:00:00.000Z').getTime(); // 946684800000
const MAX_EPOCH_MS = new Date('2099-12-31T23:59:59.999Z').getTime(); // 4102444799999

export const isoTimestampArbitrary = fc
  .integer({ min: MIN_EPOCH_MS, max: MAX_EPOCH_MS })
  .map((ms) => new Date(ms).toISOString());

export const ipV4Arbitrary = fc
  .tuple(
    fc.integer({ min: 1, max: 254 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 1, max: 254 }),
  )
  .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

// ── Composite arbitraries ─────────────────────────────────────────────────

export const rawPacketArbitrary: fc.Arbitrary<RawPacket> = fc.record({
  frameLength: fc.nat({ max: 65535 }),
  captureTimestamp: isoTimestampArbitrary,
  summary: fc.string({ minLength: 1, maxLength: 200 }),
});

export const flowArbitrary: fc.Arbitrary<Flow> = fc.record({
  id: fc.uuid(),
  srcIp: ipV4Arbitrary,
  dstIp: ipV4Arbitrary,
  srcPort: fc.integer({ min: 1, max: 65535 }),
  dstPort: fc.integer({ min: 1, max: 65535 }),
  protocol: fc.constantFrom('TCP', 'UDP', 'ICMP'),
  bytes: fc.nat(),
  packets: fc.nat(),
  timestamp: isoTimestampArbitrary,
});

export const alertArbitrary: fc.Arbitrary<Alert> = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('DDoS', 'Malware', 'Intrusion', 'Phishing', 'Anomaly'),
  severity: severityArbitrary,
  sourceIp: ipV4Arbitrary,
  destinationIp: ipV4Arbitrary,
  protocol: fc.constantFrom('TCP', 'UDP', 'ICMP'),
  timestamp: isoTimestampArbitrary,
  description: fc.string({ minLength: 1, maxLength: 500 }),
  status: alertStatusArbitrary,
  evidence: fc.record({
    flows: fc.array(flowArbitrary, { maxLength: 10 }),
    rawPackets: fc.array(rawPacketArbitrary, { maxLength: 10 }),
  }),
  blockchainHash: fc.option(
    fc.stringMatching(/^[0-9a-f]{64}$/),
    { nil: null },
  ),
  blockchainVerified: fc.boolean(),
});

export const botStatusArbitraryRecord: fc.Arbitrary<BotStatus> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  status: botStatusValueArbitrary,
  detectionCount: fc.nat(),
  lastActive: isoTimestampArbitrary,
  errorMessage: fc.option(
    fc.string({ minLength: 1, maxLength: 200 }),
    { nil: null },
  ),
});

export const throughputPointArbitrary: fc.Arbitrary<ThroughputPoint> = fc.record({
  timestamp: isoTimestampArbitrary,
  value: fc.float({ min: 0, max: 10000, noNaN: true }),
  unit: fc.constantFrom('Kbps', 'Mbps'),
});
