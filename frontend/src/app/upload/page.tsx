// frontend/src/app/upload/page.tsx
"use client";

import React, { useState } from 'react';

export default function UploadPage() {
  const [sourceCode, setSourceCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [devProof, setDevProof] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (!response.ok) throw new Error(data.detail || "Upload failed");
      setDevProof(data.dev_proof);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Modern Dark Gradient Arkaplan
    <main className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A233A] via-[#0B0F19] to-black text-slate-300 font-sans p-8 flex flex-col items-center selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-1">
            Inventor Workspace
          </h1>
          <p className="text-sm text-slate-400 font-medium">Encrypt your logic. Generate cryptographic proof.</p>
        </div>
        <a href="/" className="px-5 py-2.5 text-sm font-semibold rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all backdrop-blur-md">
          Switch to Buyer View &rarr;
        </a>
      </div>

      {/* GLASSMORPHISM UPLOAD CARD */}
      <div className="w-full max-w-4xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <span className="text-blue-400 font-bold">1</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Secure Enclave Vault</h2>
            <p className="text-xs text-slate-400">Your code never leaves the TEE. Only the hash is exposed.</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="// Paste your highly confidential smart contract or algorithm here...&#10;contract SuperSecretLogic { ... }"
              className="relative w-full h-72 bg-[#0a0d14] border border-slate-800 rounded-2xl p-6 text-cyan-300 focus:outline-none focus:border-cyan-500/50 font-mono text-sm resize-none placeholder-slate-700 shadow-inner"
              disabled={devProof !== null || isUploading}
            />
          </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

          <button 
            type="submit" 
            disabled={devProof !== null || isUploading || !sourceCode.trim()}
            className={`w-full font-bold px-6 py-4 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 ${
              devProof 
                ? 'bg-slate-800/50 text-slate-500 border border-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
            }`}
          >
            {isUploading ? (
              <span className="animate-pulse">Encrypting & Transmitting to TEE...</span>
            ) : devProof ? (
              "Locked in Hardware Enclave"
            ) : (
              "Lock Code & Generate DevProof"
            )}
          </button>
        </form>

        {/* ELEGANT DEVPROOF RESULT */}
        {devProof && (
          <div className="mt-10 p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              DevProof Generated Successfully
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Share this immutable hash with your buyers. It proves the exact state of your logic inside the enclave.
            </p>
            <div className="bg-black/50 border border-emerald-500/20 p-4 rounded-xl flex justify-between items-center group hover:border-emerald-500/50 transition-colors">
              <span className="text-emerald-300 font-mono text-sm break-all">{devProof}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
