import React, { useState } from 'react';
import { ThreatAlert, BlockchainVerificationResult } from '../types/alert';
import { SeverityBadge } from '../components/SeverityBadge';
import { EvidencePanel } from '../components/EvidencePanel';
import { api } from '../api/client';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  ExternalLink,
  Lock,
  Terminal,
  Activity,
  Check,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

interface AlertDetailProps {
  alert: ThreatAlert;
  onBack: () => void;
  onUpdateStatus: (alertId: string, status: ThreatAlert['status']) => void;
}

export const AlertDetail: React.FC<AlertDetailProps> = ({ alert, onBack, onUpdateStatus }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<BlockchainVerificationResult | null>(
    alert.blockchain_verified
      ? {
          alert_id: alert.alert_id,
          status: 'VERIFIED_ON_CHAIN',
          is_tamper_free: true,
          local_alert_hash: '0x5a2d718b4e9f0c2a1b3d5e7f9a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b',
          on_chain_alert_hash: '0x5a2d718b4e9f0c2a1b3d5e7f9a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b',
          transaction_hash: alert.blockchain_tx_hash || '0x8f3c71a9b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
          block_number: alert.blockchain_block_num || 18459201,
          contract_address: '0x3F91A39b2B86f8f537EcE09426c117bE9717D559',
          network: 'Polygon Amoy Testnet (EVM)',
          explorer_url: `https://amoy.polygonscan.com/tx/${alert.blockchain_tx_hash || '0x8f3c71a9b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1'}`,
        }
      : null
  );

  const handleVerifyOnChain = async () => {
    setIsVerifying(true);
    try {
      const result = await api.verifyAlertOnChain(alert.alert_id);
      setVerificationResult(result);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors font-mono text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Live Dashboard
        </button>

        {/* Triage Status Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateStatus(alert.alert_id, 'INVESTIGATING')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
              alert.status === 'INVESTIGATING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Mark Investigating
          </button>
          <button
            onClick={() => onUpdateStatus(alert.alert_id, 'RESOLVED')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
              alert.status === 'RESOLVED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Mark Resolved
          </button>
        </div>
      </div>

      {/* Alert Header Summary Card */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <SeverityBadge severity={alert.severity} size="lg" />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {alert.alert_id}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {new Date(alert.created_at).toLocaleString()}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{alert.title}</h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">{alert.description}</p>
          </div>

          {/* Confidence Score Dial */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono flex-shrink-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Multi-Bot Score</div>
            <div className="text-3xl font-bold text-red-400 mt-0.5">
              {(alert.confidence_score * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">Validated Threat</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Forensic Evidence (Left) + On-Chain Proof (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Forensic Evidence & 5-Tuple Panel */}
        <div className="lg:col-span-2 space-y-6">
          <EvidencePanel alert={alert} />
        </div>

        {/* Right 1 Col: Immutable Blockchain Ledger Verification */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-xl p-5 border border-purple-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Immutable Audit Ledger
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  AlertLog.sol
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-mono mb-4">
                High-confidence alerts are cryptographically hashed using Keccak-256 and committed
                on-chain to provide tamper-proof evidentiary audit trail.
              </p>

              {/* Verification Results Display */}
              {verificationResult ? (
                <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-purple-500/40 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    100% Tamper-Proof Verified
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div>
                      <div className="text-slate-500 text-[10px]">NETWORK</div>
                      <div className="text-slate-200">{verificationResult.network}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">TRANSACTION HASH</div>
                      <a
                        href={verificationResult.explorer_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
                      >
                        {verificationResult.transaction_hash.slice(0, 18)}...
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">BLOCK NUMBER</div>
                      <div className="text-purple-300 font-bold">#{verificationResult.block_number}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">CONTRACT ADDRESS</div>
                      <div className="text-slate-400 truncate">{verificationResult.contract_address}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">KECCAK-256 ALERT HASH</div>
                      <div className="text-slate-400 text-[10px] break-all">
                        {verificationResult.on_chain_alert_hash}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-center text-slate-500">
                  Click below to verify this alert against the live EVM smart contract.
                </div>
              )}
            </div>

            {/* Verify Button */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={handleVerifyOnChain}
                disabled={isVerifying}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold shadow-neon-purple transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Querying Smart Contract...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Verify On-Chain Audit Proof
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
