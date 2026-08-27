// src/pages/AlertDetailPage.tsx
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9

import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiClient from "../api/apiClient";
import { SeverityBadge } from "../components/SeverityBadge";
import { EvidencePanel } from "../components/EvidencePanel";
import { BlockchainSection } from "../components/BlockchainSection";
import type { Alert, ApiError } from "../types/alert";

// ── Loading skeleton ──────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading alert details">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 bg-gray-700 rounded-lg" />
        <div className="h-6 w-48 bg-gray-700 rounded" />
      </div>

      {/* Main card skeleton */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="h-5 w-32 bg-gray-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-20 bg-gray-700 rounded" />
              <div className="h-4 w-40 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Evidence skeleton */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="h-4 w-28 bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Field row helper ──────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function Field({ label, value, mono = false }: FieldProps) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </dt>
      <dd className={`text-sm text-gray-200 break-all ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────

export function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!id) {
      const notFoundError: ApiError = {
        statusCode: 404,
        message: "No alert ID provided",
        kind: "http",
      };
      setError(notFoundError);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    apiClient
      .fetchAlert(id)
      .then((data) => {
        if (!cancelled) {
          setAlert(data);
          setLoading(false);
        }
      })
      .catch((err: ApiError) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Req 7.9: loading state — no partial render
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  // Req 7.6: not found / error state
  if (error || !alert) {
    return (
      <div
        className="p-6 max-w-5xl mx-auto flex flex-col items-center justify-center gap-6 py-24"
        role="alert"
      >
        <svg
          className="w-16 h-16 text-gray-600"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <h1 className="text-2xl font-semibold text-gray-100">Alert not found</h1>
        <p className="text-gray-400 text-sm">
          {error?.message ?? "The requested alert does not exist or could not be loaded."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-gray-900 text-sm font-semibold hover:bg-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Req 7.8: Framer Motion fade-and-slide entrance (≤ 500 ms → 400 ms duration)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      {/* ── Page header with back button ── */}
      <div className="flex items-center gap-4">
        {/* Req 7.7: back navigation */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white truncate">
            Alert Detail
          </h1>
          <p className="text-xs text-gray-500 font-mono truncate">{alert.id}</p>
        </div>
      </div>

      {/* ── Alert metadata card ── */}
      <section
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-5"
        aria-label="Alert details"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-white">{alert.type}</h2>
            {/* Req 7.2: SeverityBadge */}
            <SeverityBadge severity={alert.severity} />
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                alert.status === "open"
                  ? "bg-red-900 text-red-300"
                  : alert.status === "investigating"
                  ? "bg-amber-900 text-amber-300"
                  : "bg-emerald-900 text-emerald-300"
              }`}
            >
              {alert.status}
            </span>
          </div>

          {alert.confidenceScore !== undefined && (
            <div className="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 font-mono text-right">
              <span className="text-[10px] text-gray-400 block uppercase">Confidence Score</span>
              <span className="text-base font-bold text-red-400">
                {(alert.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Req 7.1: all alert fields */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Alert ID" value={alert.id} mono />
          <Field label="Type" value={alert.type} />
          <Field label="Source IP" value={alert.sourceIp} mono />
          <Field
            label="Destination IP"
            value={alert.targetPort ? `${alert.destinationIp}:${alert.targetPort}` : alert.destinationIp}
            mono
          />
          <Field label="Protocol" value={alert.protocol} />
          <Field label="Timestamp" value={new Date(alert.timestamp).toLocaleString()} />
          <Field
            label="Severity"
            value={<SeverityBadge severity={alert.severity} />}
          />
          <Field label="Status" value={alert.status} />
        </dl>

        {/* 6 Specialist Bots Score Breakdown */}
        {alert.botScores && Object.keys(alert.botScores).length > 0 && (
          <div className="pt-3 border-t border-gray-800">
            <dt className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
              Specialist AI Bots Evaluation
            </dt>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              {Object.entries(alert.botScores).map(([botName, score]) => (
                <div key={botName} className="bg-gray-800/80 p-2 rounded border border-gray-700 flex justify-between items-center">
                  <span className="text-gray-400 truncate">{botName}:</span>
                  <span className={`font-bold ${score > 0.7 ? 'text-red-400' : 'text-gray-300'}`}>
                    {(score * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description spans full width */}
        <div>
          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Description
          </dt>
          <dd className="text-sm text-gray-200 leading-relaxed">{alert.description}</dd>
        </div>
      </section>

      {/* ── Req 7.3: Evidence Panel ── */}
      <section aria-label="Evidence">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Evidence
        </h2>
        <EvidencePanel evidence={alert.evidence} />
      </section>

      {/* ── Req 7.4, 7.5: Blockchain Section ── */}
      {(alert.blockchainHash !== null) && (
        <section aria-label="Blockchain evidence">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Blockchain
          </h2>
          <BlockchainSection
            hash={alert.blockchainHash}
            verified={alert.blockchainVerified}
            txHash={alert.blockchainTxHash}
            blockNum={alert.blockchainBlockNum}
          />
        </section>
      )}
    </motion.div>
  );
}

export default AlertDetailPage;
