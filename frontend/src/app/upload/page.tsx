// frontend/src/app/upload/page.tsx
"use client";

import React, { useState } from 'react';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function UploadPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_TEE_BACKEND_URL ?? "http://localhost:8000";
  const [sourceCode, setSourceCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [devProof, setDevProof] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- KODU TEE (DONANIM KASASI) İÇİNE YÜKLEME FONKSİYONU ---
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      // Python FastAPI sunucumuza POST isteği atıyoruz
      const response = await fetch(`${BACKEND_URL}/api/v1/upload-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: sourceCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      // Başarılı olursa DevProof hash'ini ekrana yansıt
      setDevProof(data.dev_proof);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-8 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 border-b border-green-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Inventor Dashboard</h1>
          <p className="text-sm text-green-600">Upload your logic. Generate DevProof. Sell securely.</p>
        </div>
        <a href="/" className="text-gray-400 hover:text-white underline transition-colors">
          Go to Buyer Terminal &rarr;
        </a>
      </div>

      {/* UPLOAD SECTION */}
      <div className="w-full max-w-4xl border border-green-800 bg-gray-950 rounded p-6 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <h2 className="text-xl font-bold mb-4 text-white">1. Secure Enclave Upload</h2>
        <p className="text-sm text-gray-400 mb-6">
          Paste your smart contract or algorithm below. It will be sent directly to the TEE (Trusted Execution Environment). 
          The AI will hash it, lock it in memory, and generate a cryptographic DevProof.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder="// Paste your highly confidential code here...&#10;contract SuperSecretLogic { ... }"
            className="w-full h-64 bg-black border border-green-900 rounded p-4 text-green-300 focus:outline-none focus:border-green-500 font-mono text-sm resize-none placeholder-green-900"
            disabled={devProof !== null || isUploading}
          />

          {error && <p className="text-red-500 text-sm">Error: {error}</p>}

          <button 
            type="submit" 
            disabled={devProof !== null || isUploading || !sourceCode.trim()}
            className={`w-full font-bold px-4 py-3 rounded border transition-colors ${
              devProof 
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                : 'bg-green-900 hover:bg-green-800 text-white border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isUploading ? "Encrypting & Uploading to TEE..." : devProof ? "Code Locked Successfully" : "Upload to TEE & Generate DevProof"}
          </button>
        </form>

        {/* DEVPROOF RESULT SECTION */}
        {devProof && (
          <div className="mt-8 p-4 border border-blue-800 bg-blue-950/30 rounded animate-fade-in">
            <h3 className="text-lg font-bold text-blue-400 mb-2">2. DevProof Generated</h3>
            <p className="text-sm text-gray-400 mb-2">
              Share this hash with your buyers. The AI will attest that this exact code is running inside the enclave.
            </p>
            <div className="bg-black border border-blue-900 p-3 rounded flex justify-between items-center">
              <span className="text-blue-300 font-mono break-all">{devProof}</span>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
