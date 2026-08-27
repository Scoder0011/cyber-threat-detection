import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/api/client";
import type { Alert } from "@/types/alert";
import { SeverityBadge } from "@/components/SeverityBadge/SeverityBadge";
import { EvidencePanel } from "@/components/EvidencePanel/EvidencePanel";

export function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getAlert(id).then(setAlert).catch((e) => setError(String(e)));
  }, [id]);

  async function verify() {
    if (!id) return;
    setVerifying(true);
    try {
      const res = await api.verifyOnChain(id);
      setAlert((a) => (a ? { ...a, chain_verified: res.verified, chain_tx_hash: res.tx_hash } : a));
    } finally {
      setVerifying(false);
    }
  }

  if (error) {
    return <p className="p-6 font-mono text-sm text-signal-critical">{error}</p>;
  }
  if (!alert) {
    return <p className="p-6 font-mono text-sm text-dim">Loading alert…</p>;
  }

  return (
    <div className="flex-1 p-6">
      <Link to="/" className="font-mono text-xs text-flow hover:underline">
        ← back to dashboard
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-ink">{alert.summary}</h1>
        <SeverityBadge severity={alert.severity} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-xs text-dim sm:grid-cols-4">
        <span>src: <span className="text-ink">{alert.src_ip}</span></span>
        <span>dst: <span className="text-ink">{alert.dst_ip}</span></span>
        <span>fused score: <span className="text-flow">{(alert.fused_score * 100).toFixed(0)}%</span></span>
        <span>created: <span className="text-ink">{new Date(alert.created_at).toLocaleString()}</span></span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EvidencePanel alert={alert} />

        <div className="rounded-lg border border-hairline bg-panel p-4">
          <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-ink">
            Chain of Custody
          </h3>
          {alert.chain_verified ? (
            <div className="space-y-1 font-mono text-xs">
              <p className="text-signal-low">✓ verified on-chain</p>
              <p className="break-all text-dim">{alert.chain_tx_hash}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-mono text-xs text-dim">Not yet verified against AlertLog.sol.</p>
              <button
                onClick={verify}
                disabled={verifying}
                className="rounded bg-flow px-3 py-1.5 font-mono text-xs text-void disabled:opacity-50"
              >
                {verifying ? "Verifying…" : "Verify on-chain"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}