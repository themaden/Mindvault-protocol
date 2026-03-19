"use client";

import React, { useState } from "react";
import { getErrorMessage } from "../../lib/errors";

type Props = {
  backendUrl: string;
  onDevProof: (devProof: string) => void;
  onSystemLog: (text: string) => void;
};

export function SellerPanel({ backendUrl: _backendUrl, onDevProof, onSystemLog }: Props) {
  void _backendUrl;
  const [isOpen, setIsOpen] = useState(false);
  const [sourceCode, setSourceCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!sourceCode.trim()) return;
    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/upload-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: sourceCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      const devProof = String(data.dev_proof ?? "");
      onDevProof(devProof);
      onSystemLog(`> SELLER: Code locked in enclave. Dev Proof: ${devProof || "N/A"}`);
      setIsOpen(false);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      onSystemLog(`> ERROR: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t pt-4" style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full text-left text-sm font-bold text-emerald-50 flex items-center justify-between"
        type="button"
      >
        <span>Seller Panel (Local Demo)</span>
        <span className="text-xs text-emerald-100/60 mv-mono">{isOpen ? "HIDE" : "SHOW"}</span>
      </button>

      {isOpen && (
        <div className="mt-3">
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder="Paste source code here, then lock it into the enclave..."
            className="w-full min-h-[150px] bg-black/20 border rounded-lg p-3 text-xs text-emerald-100/85 placeholder-emerald-200/20 focus:outline-none focus:border-emerald-400 mv-mono"
            style={{ borderColor: "rgba(52, 211, 153, 0.22)" }}
            disabled={isUploading}
          />

          {error && (
            <div
              className="mt-3 rounded-lg border px-3 py-2 text-xs text-red-200/90 mv-mono"
              style={{ borderColor: "rgba(248, 113, 113, 0.35)", background: "rgba(127, 29, 29, 0.2)" }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading || !sourceCode.trim()}
            className="mv-btn mt-3 w-full py-3"
            style={{
              borderColor: !isUploading && sourceCode.trim() ? "rgba(236, 72, 153, 0.45)" : "rgba(52, 211, 153, 0.15)",
              background: !isUploading && sourceCode.trim() ? "rgba(131, 24, 67, 0.55)" : "rgba(6, 20, 16, 0.45)",
            }}
          >
            {isUploading ? "Uploading..." : "Lock Code In Enclave"}
          </button>

          <p className="text-xs text-emerald-100/45 text-center mt-2">
            Uploads code to the backend in-memory enclave for demo purposes.
          </p>
        </div>
      )}
    </div>
  );
}
