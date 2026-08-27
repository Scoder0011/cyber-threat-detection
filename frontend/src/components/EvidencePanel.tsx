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
    <li className="border-b border-slate-200/80 last:border-b-0">
      {/* Collapsed row — always visible (Req 8.1) */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`flow-detail-${flow.id}`}
        onClick={() => onToggle(flow.id)}
        className="w-full flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
      >
        {/* Row index */}
        <span className="text-slate-400 font-mono text-xs w-5 shrink-0">
          {index + 1}
        </span>

        {/* 5-tuple */}
        <span className="text-slate-800 font-mono font-medium">
          {flow.srcIp}:{flow.srcPort}
        </span>
        <span className="text-slate-400">→</span>
        <span className="text-slate-800 font-mono font-medium">
          {flow.dstIp}:{flow.dstPort}
        </span>

        {/* Protocol */}
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-blue-600 uppercase border border-slate-200">
          {flow.protocol}
        </span>

        {/* Bytes / Packets */}
        <span className="text-slate-500 text-xs ml-auto">
          {flow.bytes.toLocaleString()} B &nbsp;·&nbsp; {flow.packets.toLocaleString()} pkts
        </span>

        {/* Chevron indicator */}
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
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
          className="px-4 pb-4 pt-2 bg-slate-50 text-sm space-y-3 border-t border-slate-200/60"
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
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
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
              className="border-t border-slate-200 pt-3"
              role="alert"
              aria-label="Packet data unavailable"
            >
              <p className="text-xs text-amber-600">Packet data unavailable</p>
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
      <p className="text-slate-400 mb-0.5 text-[11px]">{label}</p>
      <p className={`text-slate-800 break-all ${mono ? "font-mono font-medium" : "font-medium"}`}>{value}</p>
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
        className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-8 shadow-sm"
        aria-label="No evidence available"
      >
        <p className="text-slate-400 text-sm">No evidence available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
