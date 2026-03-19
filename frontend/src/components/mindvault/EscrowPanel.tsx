"use client";

import React from "react";
import { CopyField } from "./CopyField";
import { SellerPanel } from "./SellerPanel";

type Props = {
  askPriceEth: string;
  devProof: string | null;
  releaseSignature: string | null;
  walletConnected: boolean;
  isTransactionPending: boolean;
  onLockFunds: () => void;
  onReleaseFunds: () => void;
  backendUrl: string;
  onDevProof: (devProof: string) => void;
  onSystemLog: (text: string) => void;
};

export function EscrowPanel({
  askPriceEth,
  devProof,
  releaseSignature,
  walletConnected,
  isTransactionPending,
  onLockFunds,
  onReleaseFunds,
  backendUrl,
  onDevProof,
  onSystemLog,
}: Props) {
  return (
    <div className="mv-card mv-fade-up p-6 h-fit flex flex-col gap-6">
      <h2
        className="text-xl font-bold border-b pb-3 text-emerald-50"
        style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}
      >
        Escrow Status
      </h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-emerald-100/60">Asking Price</span>
          <span className="text-emerald-50 font-bold">{askPriceEth} ETH</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-emerald-100/60">Enclave</span>
          <span className="text-emerald-50 font-bold">{devProof ? "LOCKED" : "EMPTY"}</span>
        </div>
        {devProof && <CopyField label="Dev Proof" value={devProof} />}
      </div>

      <button
        onClick={onLockFunds}
        disabled={!walletConnected || isTransactionPending}
        className="mv-btn w-full py-3"
        style={{
          borderColor: walletConnected && !isTransactionPending ? "rgba(59, 130, 246, 0.55)" : "rgba(52, 211, 153, 0.15)",
          background: walletConnected && !isTransactionPending ? "rgba(30, 64, 175, 0.55)" : "rgba(6, 20, 16, 0.45)",
        }}
      >
        {isTransactionPending ? "Processing..." : `Step 1: Lock ${askPriceEth} ETH`}
      </button>

      <button
        onClick={onReleaseFunds}
        disabled={!releaseSignature || isTransactionPending}
        className={`mv-btn w-full py-3 ${releaseSignature ? "animate-pulse" : ""}`}
        style={{
          borderColor:
            releaseSignature && !isTransactionPending ? "rgba(52, 211, 153, 0.55)" : "rgba(52, 211, 153, 0.15)",
          background:
            releaseSignature && !isTransactionPending ? "rgba(4, 120, 87, 0.55)" : "rgba(6, 20, 16, 0.45)",
        }}
      >
        {releaseSignature ? "Step 2: RELEASE FUNDS (AI Signed)" : "Awaiting AI Signature..."}
      </button>

      {releaseSignature && <CopyField label="TEE Signature" value={releaseSignature} />}

      <p className="text-xs text-emerald-100/45 text-center -mt-2">
        AI signature required to unlock smart contract funds.
      </p>

      <SellerPanel backendUrl={backendUrl} onDevProof={onDevProof} onSystemLog={onSystemLog} />
    </div>
  );
}
