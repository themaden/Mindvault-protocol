// frontend/src/app/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../lib/constants';

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [realAddress, setRealAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    { role: 'system', text: 'System initialized inside Trusted Execution Environment (Dstack).' },
    { role: 'system', text: 'Verifying remote attestation... OK.' },
    { role: 'ai', text: 'Hello. I am the MindVault Arbiter. The seller has locked the codebase. Ask me anything about its logic or security.' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [releaseSignature, setReleaseSignature] = useState<string | null>(null);

  // Otomatik aşağı kaydırma için
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setRealAddress(address);
        const maskedAddress = `Anon_${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
        setWallet(maskedAddress);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: inputValue }]);
    const userQuestion = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/ask-ndai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      let aiResponseText = data.agent_response;
      
      if (aiResponseText.includes("Ready to sign.")) {
        const sigResponse = await fetch("http://localhost:8000/api/v1/sign-release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyer_address: realAddress }),
        });
        
        const sigData = await sigResponse.json();
        if (sigResponse.ok && sigData.signature) {
          setReleaseSignature(sigData.signature);
          aiResponseText += `\n\n[SYSTEM LOG: Cryptographic Signature Acquired: ${sigData.signature.substring(0, 16)}...]`;
        }
      }
      setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'system', text: `ERROR: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockFunds = async () => {
    if (!window.ethereum) return alert("MetaMask is not installed!");
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
      const tx = await escrowContract.lockFunds({ value: ethers.parseEther("2.5") });
      await tx.wait();
      alert("Success! 2.5 ETH securely locked.");
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsTransactionPending(false);
    }
  };

  const handleReleaseFunds = async () => {
    if (!window.ethereum || !releaseSignature) return;
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
      const tx = await escrowContract.releaseFundsWithSignature(releaseSignature);
      await tx.wait();
      alert("DEAL COMPLETED! Funds transferred and Code Unlocked!");
      setReleaseSignature(null);
    } catch (error) {
      console.error("Release failed:", error);
    } finally {
      setIsTransactionPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A233A] via-[#0B0F19] to-black text-slate-300 font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1">
            MindVault <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Protocol</span>
          </h1>
          <p className="text-sm text-slate-400">Zero-Trust IP Escrow via TEE &  AI</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a href="/upload" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">For Inventors</a>
          <button 
            onClick={connectWallet}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            {wallet ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {wallet}
              </span>
            ) : 'Connect ASC Wallet'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* AI CHAT INTERFACE */}
        <div className="col-span-2 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
          {/* Chat Header */}
          <div className="bg-black/20 border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-xs">AI</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">MindVault Arbiter</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online (Dstack TEE)
                </p>
              </div>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm' 
                    : msg.role === 'system'
                    ? 'bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-mono w-full text-center'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/20 border-t border-white/5">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={wallet ? "Ask about security, logic, or type 'approve the transaction'..." : "Connect wallet to interact with AI..."}
                disabled={!wallet || isLoading}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-full py-4 pl-6 pr-16 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!wallet || isLoading || !inputValue.trim()}
                className="absolute right-2 p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
        </div>

        {/* DEFI ESCROW WIDGET */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 h-fit shadow-2xl flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Deal Setup
          </h2>
          
          <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Asset</span>
              <span className="text-white font-medium flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div> ETH
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Price</span>
              <span className="text-2xl font-bold text-white">2.5</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 Button */}
            <button 
              onClick={handleLockFunds}
              disabled={!wallet || isTransactionPending}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                wallet && !isTransactionPending
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              {isTransactionPending ? "Awaiting Confirmation..." : "1. Lock 2.5 ETH in Escrow"}
            </button>

            {/* Step 2 Button */}
            <button 
              onClick={handleReleaseFunds}
              disabled={!releaseSignature || isTransactionPending}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                releaseSignature && !isTransactionPending
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-[1.02]' 
                  : 'bg-slate-800/20 text-slate-600 border border-slate-800/50 cursor-not-allowed'
              }`}
            >
              {releaseSignature && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
              <span className="relative z-10">{releaseSignature ? "2. Execute Deal (AI Signed)" : "Awaiting TEE Signature..."}</span>
            </button>
          </div>
          
          <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-300 text-center flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Smart contract requires NDAI cryptographic signature to unlock funds.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}