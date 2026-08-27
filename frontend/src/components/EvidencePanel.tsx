// src/components/EvidencePanel.tsx
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6

import { useState } from "react";
import type { Evidence, Flow, RawPacket } from "../types/alert";

interface EvidencePanelProps {
  evidence: Evidence;
}

interface FlowRowProps {
  flow: Flow;
  index: number;
  isExpanded: boolean;
  rawPacket: RawPacket | undefined;
  onToggle: (id: string) => void;
}

function FlowRow({ flow, index, isExpanded, rawPacket, onToggle }: FlowRowProps) {
  return (
    <li className="border-b border-gray-700 last:border-b-0">
      {/* Collapsed row — always visible (Req 8.1) */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`flow-detail-${flow.id}`}
        onClick={() => onToggle(flow.id)}
        className="w-full flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        {/* Row index */}
        <span className="text-gray-500 font-mono text-xs w-5 shrink-0">
          {index + 1}
        </span>

        {/* 5-tuple */}
        <span className="text-gray-300 font-mono">
          {flow.srcIp}:{flow.srcPort}
        </span>
        <span className="text-gray-500">→</span>
        <span className="text-gray-300 font-mono">
          {flow.dstIp}:{flow.dstPort}
        </span>

        {/* Protocol */}
        <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-700 text-cyan-300 uppercase">
          {flow.protocol}
        </span>

        {/* Bytes / Packets */}
        <span className="text-gray-400 text-xs ml-auto">
          {flow.bytes.toLocaleString()} B &nbsp;·&nbsp; {flow.packets.toLocaleString()} pkts
        </span>

        {/* Chevron indicator */}
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail section (Req 8.2, 8.3, 8.4, 8.6) */}
      {isExpanded && (
        <div
          id={`flow-detail-${flow.id}`}
          className="px-4 pb-4 pt-2 bg-gray-800 text-sm space-y-3"
        >
          {/* Full flow metadata recap */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <DetailField label="Src IP" value={flow.srcIp} />
            <DetailField label="Dst IP" value={flow.dstIp} />
            <DetailField label="Src Port" value={String(flow.srcPort)} />
            <DetailField label="Dst Port" value={String(flow.dstPort)} />
            <DetailField label="Protocol" value={flow.protocol.toUpperCase()} />
            <DetailField label="Bytes" value={flow.bytes.toLocaleString()} />
            <DetailField label="Packets" value={flow.packets.toLocaleString()} />
            <DetailField label="Timestamp" value={flow.timestamp} mono />
            {flow.tcpFlags && <DetailField label="TCP Flags" value={flow.tcpFlags} />}
            {flow.packetRatePps !== undefined && (
              <DetailField label="Packet Rate" value={`${flow.packetRatePps.toLocaleString()} pps`} />
            )}
            {flow.entropy !== undefined && (
              <DetailField label="Entropy" value={flow.entropy.toFixed(3)} />
            )}
            {flow.ja3Hash && (
              <DetailField label="JA3 Fingerprint" value={flow.ja3Hash} mono />
            )}
          </div>

          {/* Raw packet metadata (Req 8.2) — or error fallback (Req 8.6) */}
          {rawPacket !== undefined ? (
            <div className="border-t border-gray-700 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Packet Capture
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <DetailField
                  label="Frame Length"
                  value={`${rawPacket.frameLength} bytes`}
                />
                <DetailField
                  label="Capture Timestamp"
                  value={rawPacket.captureTimestamp}
                  mono
                />
                <DetailField label="Summary" value={rawPacket.summary} />
              </div>
            </div>
          ) : (
            // Req 8.6: error fallback when rawPacket is missing
            <div
              className="border-t border-gray-700 pt-3"
              role="alert"
              aria-label="Packet data unavailable"
            >
              <p className="text-xs text-amber-400">Packet data unavailable</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

interface DetailFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DetailField({ label, value, mono = false }: DetailFieldProps) {
  return (
    <div>
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className={`text-gray-200 break-all ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export function EvidencePanel({ evidence }: EvidencePanelProps) {
  // Req 8.3: only one row expanded at a time
  const [expandedFlowId, setExpandedFlowId] = useState<string | null>(null);

  function handleToggle(id: string) {
    // Req 8.4: clicking an expanded row collapses it
    setExpandedFlowId((prev) => (prev === id ? null : id));
  }

  // Req 8.5: empty state
  if (evidence.flows.length === 0) {
    return (
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center p-8"
        aria-label="No evidence available"
      >
        <p className="text-gray-400 text-sm">No evidence available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Network Flows
        </h3>
      </div>

      {/* Accordion list (Req 8.1, 8.3) */}
      <ul aria-label="Network flow evidence list">
        {evidence.flows.map((flow, index) => (
          <FlowRow
            key={flow.id}
            flow={flow}
            index={index}
            // Req 8.2: match flow at index i with rawPackets[i]
            rawPacket={evidence.rawPackets[index]}
            isExpanded={expandedFlowId === flow.id}
            onToggle={handleToggle}
          />
        ))}
      </ul>
    </div>
  );
}

export default EvidencePanel;
