// frontend/src/app/page.tsx
"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../lib/constants';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function Home() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_TEE_BACKEND_URL ?? "http://localhost:8000";

  // --- STATE MANAGEMENT ---
  const [wallet, setWallet] = useState<string | null>(null);
  const [realAddress, setRealAddress] = useState<string | null>(null); // İmza için gerçek adres lazım
  const [messages, setMessages] = useState([
    { role: 'system', text: '> System initialized inside Trusted Execution Environment (Dstack).' },
    { role: 'system', text: '> Verifying remote attestation... OK.' },
    { role: 'ai', text: '> Hello. I am the MindVault Arbiter. The seller has locked the codebase. Ask me anything about its logic or security.' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [releaseSignature, setReleaseSignature] = useState<string | null>(null); // AI'dan gelen imza
  const [sellerCode, setSellerCode] = useState("");
  const [isUploadPending, setIsUploadPending] = useState(false);
  const [devProof, setDevProof] = useState<string | null>(null);
  const [isSellerPanelOpen, setIsSellerPanelOpen] = useState(false);

  // --- WALLET CONNECTION (ASC LOGIC) ---
  const connectWallet = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      alert("Please install MetaMask to use MindVault.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setRealAddress(address); // Arka planda gerçek adresi tutuyoruz (İmza için)
      
      // Ekranda doxxing olmasın diye maskelenmiş ASC adresini gösteriyoruz
      const maskedAddress = `Anon_${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
      setWallet(maskedAddress);
    } catch (error: unknown) {
      console.error("Wallet connection failed:", error);
    }
  };

  // --- SEND MESSAGE TO REAL DEEPSEEK AI ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user', text: `> ${inputValue}` }];
    setMessages(newMessages);
    const userQuestion = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // 1. TEE Backend'e soruyu gönderiyoruz
      const response = await fetch(`${BACKEND_URL}/api/v1/ask-ndai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      let aiResponseText = `> ${data.agent_response}`;
      
      // 2. Eğer AI Onay verdiyse (Backend'in koyduğu gizli mesajı yakalıyoruz)
      if (aiResponseText.includes("Ready to sign.")) {
        if (!realAddress) throw new Error("Wallet address is missing. Please reconnect your wallet.");
        // AI onayladı! Hemen Oasis ROFL imzasını talep et
        const sigResponse = await fetch(`${BACKEND_URL}/api/v1/sign-release`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyer_address: realAddress }),
        });
        
        const sigData = await sigResponse.json();
        if (sigResponse.ok && sigData.signature) {
          setReleaseSignature(sigData.signature); // İmzayı state'e kaydet
          aiResponseText += `\n\n[SYSTEM LOG: Cryptographic Signature Acquired: ${sigData.signature.substring(0, 20)}...]\n> You can now unlock the funds.`;
        }
      }

      setMessages((prev) => [...prev, { role: 'ai', text: aiResponseText }]);

    } catch (error: unknown) {
      console.error("Failed to fetch AI response", error);
      setMessages((prev) => [...prev, { role: 'system', text: `> ERROR: ${getErrorMessage(error)}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- SELLER: UPLOAD CODE TO ENCLAVE ---
  const handleUploadCode = async () => {
    if (!sellerCode.trim()) return;
    setIsUploadPending(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/upload-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: sellerCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      setDevProof(data.dev_proof ?? null);
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: `> SELLER: Code locked in enclave. Dev Proof: ${String(data.dev_proof ?? 'N/A')}` },
      ]);
    } catch (error: unknown) {
      console.error("Failed to upload code", error);
      setMessages((prev) => [...prev, { role: 'system', text: `> ERROR: ${getErrorMessage(error)}` }]);
    } finally {
      setIsUploadPending(false);
    }
  };

  // --- SMART CONTRACT INTERACTION 1: LOCK FUNDS ---
  const handleLockFunds = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) return alert("MetaMask is not installed!");
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      const valueToLock = ethers.parseEther("2.5");
      const tx = await escrowContract.lockFunds({ value: valueToLock });
      await tx.wait();
      
      alert("Success! 2.5 ETH securely locked in the Smart Contract.");
    } catch (error) {
      console.error("Lock Transaction failed:", error);
    } finally {
      setIsTransactionPending(false);
    }
  };

  // --- SMART CONTRACT INTERACTION 2: RELEASE FUNDS WITH SIGNATURE ---
  const handleReleaseFunds = async () => {
    const ethereum = window.ethereum;
    if (!ethereum || !releaseSignature) return;
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      console.log("Submitting TEE Signature to Blockchain...");
      
      // TEE'den gelen dijital imzayı akıllı kontrata veriyoruz
      const tx = await escrowContract.releaseFundsWithSignature(releaseSignature);
      await tx.wait();
      
      alert("DEAL COMPLETED! Signature verified by smart contract. Funds transferred to Seller and Code Unlocked!");
      setReleaseSignature(null); // İşlem bitince imzayı temizle
    } catch (error) {
      console.error("Release Transaction failed:", error);
      alert("Failed to release funds. Did you lock the funds first?");
    } finally {
      setIsTransactionPending(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-10 text-emerald-100">
      <div className="mx-auto w-full max-w-6xl">
        {/* HEADER */}
        <header className="mv-card px-6 py-5 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              MindVault Protocol
            </h1>
            <p className="text-sm mt-2 text-emerald-200/70">
              Show the Proof, Hide the Logic. Powered by NDAI and ASC.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border px-3 py-1 text-emerald-100/80" style={{ borderColor: "var(--mv-border)" }}>
                Backend: {BACKEND_URL}
              </span>
              <span className="rounded-full border px-3 py-1 text-emerald-100/80" style={{ borderColor: "var(--mv-border)" }}>
                Enclave: {devProof ? "LOCKED" : "EMPTY"}
              </span>
            </div>
          </div>
          <button
            onClick={connectWallet}
            className="mv-btn w-full md:w-auto"
          >
            {wallet ? `Connected: ${wallet}` : 'Connect ASC Wallet'}
          </button>
        </header>

        {/* MAIN GRID SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          {/* AI TERMINAL */}
          <div className="col-span-2 mv-card p-4 h-[640px] flex flex-col">
            <div className="border-b pb-3 mb-4 flex justify-between items-center" style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                <span className="ml-3 text-xs text-emerald-200/55 mv-mono">root@tee-enclave:~# NDAI_SESSION_ACTIVE</span>
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
            </div>
          
            <div className="flex-grow overflow-y-auto space-y-4 text-sm flex flex-col whitespace-pre-wrap mv-mono pr-1">
              {messages.map((msg, idx) => (
                <p
                  key={idx}
                  className={
                    msg.role === 'user'
                      ? 'text-emerald-50'
                      : msg.role === 'ai'
                        ? 'text-emerald-200'
                        : 'text-emerald-100/55'
                  }
                >
                  {msg.text}
                </p>
              ))}
              {isLoading && <p className="text-emerald-300 animate-pulse">{`> AI is analyzing the enclave...`}</p>}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 items-center border-t pt-4" style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}>
              <span className="text-emerald-300 font-bold mv-mono">{`>`}</span>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask the AI to analyze, or type 'approve the transaction'..." 
                className="w-full bg-black/20 rounded-lg border px-3 py-2 focus:outline-none focus:border-emerald-400 text-emerald-100 placeholder-emerald-200/20 mv-mono"
                style={{ borderColor: "rgba(52, 211, 153, 0.22)" }}
                disabled={!wallet || isLoading}
              />
              <button type="submit" className="hidden">Send</button>
            </form>
          </div>

          {/* ESCROW STATUS PANEL */}
          <div className="mv-card p-6 h-fit flex flex-col gap-6">
            <h2 className="text-xl font-bold border-b pb-3 text-emerald-50" style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}>
              Escrow Status
            </h2>
          
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-emerald-100/60">Asking Price</span>
                <span className="text-emerald-50 font-bold">2.5 ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-100/60">Enclave</span>
                <span className="text-emerald-50 font-bold">{devProof ? "LOCKED" : "EMPTY"}</span>
              </div>
              {devProof && (
                <div className="text-xs text-emerald-100/55 break-all mv-mono">
                  Dev Proof: <span className="text-emerald-100/80">{devProof}</span>
                </div>
              )}
            </div>

            {/* 1. LOCK FUNDS BUTTON */}
            <button 
              onClick={handleLockFunds}
              disabled={!wallet || isTransactionPending}
              className="mv-btn w-full py-3"
              style={{
                borderColor: wallet && !isTransactionPending ? "rgba(59, 130, 246, 0.55)" : "rgba(52, 211, 153, 0.15)",
                background: wallet && !isTransactionPending ? "rgba(30, 64, 175, 0.55)" : "rgba(6, 20, 16, 0.45)",
              }}
            >
              {isTransactionPending ? "Processing..." : "Step 1: Lock 2.5 ETH"}
            </button>

            {/* 2. RELEASE FUNDS BUTTON (Only active if AI gives signature) */}
            <button 
              onClick={handleReleaseFunds}
              disabled={!releaseSignature || isTransactionPending}
              className={`mv-btn w-full py-3 ${releaseSignature ? "animate-pulse" : ""}`}
              style={{
                borderColor: releaseSignature && !isTransactionPending ? "rgba(52, 211, 153, 0.55)" : "rgba(52, 211, 153, 0.15)",
                background: releaseSignature && !isTransactionPending ? "rgba(4, 120, 87, 0.55)" : "rgba(6, 20, 16, 0.45)",
              }}
            >
              {releaseSignature ? "Step 2: RELEASE FUNDS (AI Signed)" : "Awaiting AI Signature..."}
            </button>
          
            <p className="text-xs text-emerald-100/45 text-center -mt-2">
              AI signature required to unlock smart contract funds.
            </p>

            {/* SELLER PANEL (demo/local) */}
            <div className="border-t pt-4" style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}>
              <button
                onClick={() => setIsSellerPanelOpen((v) => !v)}
                className="w-full text-left text-sm font-bold text-emerald-50 flex items-center justify-between"
                type="button"
              >
                <span>Seller Panel (Local Demo)</span>
                <span className="text-xs text-emerald-100/60 mv-mono">{isSellerPanelOpen ? "HIDE" : "SHOW"}</span>
              </button>

              {isSellerPanelOpen && (
                <div className="mt-3">
                  <textarea
                    value={sellerCode}
                    onChange={(e) => setSellerCode(e.target.value)}
                    placeholder="Paste source code here, then lock it into the enclave..."
                    className="w-full min-h-[150px] bg-black/20 border rounded-lg p-3 text-xs text-emerald-100/85 placeholder-emerald-200/20 focus:outline-none focus:border-emerald-400 mv-mono"
                    style={{ borderColor: "rgba(52, 211, 153, 0.22)" }}
                    disabled={isUploadPending}
                  />
                  <button
                    onClick={handleUploadCode}
                    disabled={isUploadPending || !sellerCode.trim()}
                    className="mv-btn mt-3 w-full py-3"
                    style={{
                      borderColor: !isUploadPending && sellerCode.trim() ? "rgba(236, 72, 153, 0.45)" : "rgba(52, 211, 153, 0.15)",
                      background: !isUploadPending && sellerCode.trim() ? "rgba(131, 24, 67, 0.55)" : "rgba(6, 20, 16, 0.45)",
                    }}
                  >
                    {isUploadPending ? "Uploading..." : "Lock Code In Enclave"}
                  </button>
                  <p className="text-xs text-emerald-100/45 text-center mt-2">
                    Uploads code to the backend in-memory enclave for demo purposes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
