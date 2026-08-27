// src/components/BlockchainSection.tsx

interface BlockchainSectionProps {
  hash: string | null;
  verified: boolean;
}

export function BlockchainSection({ hash, verified }: BlockchainSectionProps) {
  // Requirements 7.4, 7.5: render nothing when hash is absent
  if (hash === null || hash === '') {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Blockchain Evidence
      </h3>

      {/* Hash value — monospace, wraps on long hashes */}
      <p
        className="font-mono text-sm text-gray-200 break-all"
        aria-label="Blockchain hash"
      >
        {hash}
      </p>

      {/* Verification status badge */}
      {verified ? (
        // Requirement 7.4: verified → green "Verified on-chain" badge
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500 text-white"
          aria-label="Blockchain verification status: Verified on-chain"
        >
          Verified on-chain
        </span>
      ) : (
        // Requirement 7.5: pending → amber "Verification Pending" indicator
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-amber-400 text-black"
          aria-label="Blockchain verification status: Verification Pending"
        >
          Verification Pending
        </span>
      )}
    </div>
  );
}

export default BlockchainSection;
