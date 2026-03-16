// frontend/src/app/page.tsx
"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../lib/constants';

export default function Home() {
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

  // --- WALLET CONNECTION (ASC LOGIC) ---
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setRealAddress(address); // Arka planda gerçek adresi tutuyoruz (İmza için)
        
        // Ekranda doxxing olmasın diye maskelenmiş ASC adresini gösteriyoruz
        const maskedAddress = `Anon_${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
        setWallet(maskedAddress);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask to use MindVault.");
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
      const response = await fetch("http://localhost:8000/api/v1/ask-ndai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      let aiResponseText = `> ${data.agent_response}`;
      
      // 2. Eğer AI Onay verdiyse (Backend'in koyduğu gizli mesajı yakalıyoruz)
      if (aiResponseText.includes("Ready to sign.")) {
        // AI onayladı! Hemen Oasis ROFL imzasını talep et
        const sigResponse = await fetch("http://localhost:8000/api/v1/sign-release", {
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

    } catch (error: any) {
      console.error("Failed to fetch AI response", error);
      setMessages((prev) => [...prev, { role: 'system', text: `> ERROR: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- SMART CONTRACT INTERACTION 1: LOCK FUNDS ---
  const handleLockFunds = async () => {
    if (!window.ethereum) return alert("MetaMask is not installed!");
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(window.ethereum as any);
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
    if (!window.ethereum || !releaseSignature) return;
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(window.ethereum as any);
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
    <main className="min-h-screen bg-black text-green-400 font-mono p-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-green-800 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">MindVault Protocol</h1>
          <p className="text-sm text-green-600 mt-2">"Show the Proof, Hide the Logic." | Powered by NDAI & ASC</p>
        </div>
        <button 
          onClick={connectWallet}
          className="mt-4 md:mt-0 bg-green-900 hover:bg-green-800 text-white px-6 py-2 rounded transition-colors border border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
        >
          {wallet ? `Connected: ${wallet}` : 'Connect ASC Wallet'}
        </button>
      </header>

      {/* MAIN GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* AI TERMINAL */}
        <div className="col-span-2 border border-green-800 bg-gray-950 rounded p-4 h-[600px] flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="border-b border-green-900 pb-2 mb-4 flex justify-between items-center">
            <span className="text-xs text-gray-500">root@tee-enclave:~# NDAI_SESSION_ACTIVE</span>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-4 text-sm flex flex-col whitespace-pre-wrap">
            {messages.map((msg, idx) => (
              <p key={idx} className={msg.role === 'user' ? 'text-white' : msg.role === 'ai' ? 'text-green-300' : 'text-gray-400'}>
                {msg.text}
              </p>
            ))}
            {isLoading && <p className="text-green-500 animate-pulse">{`> AI is analyzing the enclave...`}</p>}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 items-center border-t border-green-900 pt-4">
            <span className="text-green-500 font-bold">{`>`}</span>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask the AI to analyze, or type 'approve the transaction'..." 
              className="w-full bg-transparent focus:outline-none focus:border-green-500 text-green-400 p-2 placeholder-green-800/50"
              disabled={!wallet || isLoading}
            />
            <button type="submit" className="hidden">Send</button>
          </form>
        </div>

        {/* ESCROW STATUS PANEL */}
        <div className="border border-green-800 bg-gray-950 rounded p-6 h-fit flex flex-col gap-6">
          <h2 className="text-xl font-bold border-b border-green-900 pb-2 text-white">Escrow Status</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Asking Price:</span>
              <span className="text-white font-bold">2.5 ETH</span>
            </div>
          </div>

          {/* 1. LOCK FUNDS BUTTON */}
          <button 
            onClick={handleLockFunds}
            disabled={!wallet || isTransactionPending}
            className={`w-full font-bold px-4 py-3 rounded border transition-colors ${
              wallet && !isTransactionPending
                ? 'bg-blue-900 hover:bg-blue-800 text-white border-blue-500' 
                : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
            }`}
          >
            {isTransactionPending ? "Processing..." : "Step 1: Lock 2.5 ETH"}
          </button>

          {/* 2. RELEASE FUNDS BUTTON (Only active if AI gives signature) */}
          <button 
            onClick={handleReleaseFunds}
            disabled={!releaseSignature || isTransactionPending}
            className={`w-full font-bold px-4 py-3 rounded border transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
              releaseSignature && !isTransactionPending
                ? 'bg-green-700 hover:bg-green-600 text-white border-green-400 animate-pulse' 
                : 'bg-gray-900 text-gray-700 border-gray-800 cursor-not-allowed'
            }`}
          >
            {releaseSignature ? "Step 2: RELEASE FUNDS (AI Signed)" : "Awaiting AI Signature..."}
          </button>
          
          <p className="text-xs text-gray-600 text-center mt-2">
            AI Signature required to unlock smart contract funds.
          </p>
        </div>
      </div>
    </main>
  );
}