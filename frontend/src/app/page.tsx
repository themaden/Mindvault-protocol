"use client"; // Next.js 14'te state kullanmak için bu satır zorunludur

import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function Home() {
  // --- DURUM YÖNETİMİ (STATE) ---
  const [wallet, setWallet] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    { role: 'system', text: '> System initialized inside Trusted Execution Environment (Dstack).' },
    { role: 'system', text: '> Verifying remote attestation... OK.' },
    { role: 'ai', text: '> Hello. I am the MindVault Arbiter. The seller has locked the codebase. Ask me anything about its logic or security.' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- CÜZDAN BAĞLAMA (ASC SİMÜLASYONU) ---
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // ASC (Anonymous Smart Credentials) Mantığı: 
        // Gerçek adresi gizleyip sisteme sadece anonim bir ID veriyoruz.
        const maskedAddress = `Anon_${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
        setWallet(maskedAddress);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask to use MindVault.");
    }
  };

  // --- YAPAY ZEKA İLE SOHBET ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Kullanıcının mesajını ekrana ekle
    const newMessages = [...messages, { role: 'user', text: `> ${inputValue}` }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // TEE Backend'imize istek atıyoruz (FastAPI sunucumuzun açık olması gerekir)
      // Hackathon sunumunda hata almamak için şimdilik Mock bir gecikme ekliyoruz:
      setTimeout(() => {
        let aiResponse = "> Analysis complete. The code logic is sound. Ask me to approve if you are satisfied.";
        if (inputValue.toLowerCase().includes("approve")) {
          aiResponse = "> I have verified the code. I am ready to sign the release transaction.";
        } else if (inputValue.toLowerCase().includes("show code")) {
          aiResponse = "> ACCESS DENIED. NDAI Protocol strictly forbids leaking raw source code.";
        }

        setMessages((prev) => [...prev, { role: 'ai', text: aiResponse }]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Failed to fetch AI response", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-8">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-green-800 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">MindVault Protocol</h1>
          <p className="text-sm text-green-600 mt-2">"Show the Proof, Hide the Logic." | Powered by NDAI & ASC</p>
        </div>
        
        {/* Dinamik Cüzdan Butonu */}
        <button 
          onClick={connectWallet}
          className="mt-4 md:mt-0 bg-green-900 hover:bg-green-800 text-white px-6 py-2 rounded transition-colors border border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
        >
          {wallet ? `Connected: ${wallet}` : 'Connect ASC Wallet'}
        </button>
      </header>

      {/* MAIN GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* AI TERMINAL WINDOW */}
        <div className="col-span-2 border border-green-800 bg-gray-950 rounded p-4 h-[600px] flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="border-b border-green-900 pb-2 mb-4 flex justify-between items-center">
            <span className="text-xs text-gray-500">root@tee-enclave:~# NDAI_SESSION_ACTIVE</span>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-4 text-sm flex flex-col">
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
              placeholder="E.g., Does this code contain any malicious backdoors?" 
              className="w-full bg-transparent focus:outline-none focus:border-green-500 text-green-400 p-2 placeholder-green-800/50"
              disabled={!wallet || isLoading}
            />
            <button type="submit" className="hidden">Send</button>
          </form>
          {!wallet && <p className="text-xs text-red-500 mt-2">You must connect your ASC Wallet to interact with the AI.</p>}
        </div>

        {/* ESCROW STATUS PANEL */}
        <div className="border border-green-800 bg-gray-950 rounded p-6 h-fit">
          <h2 className="text-xl font-bold border-b border-green-900 pb-2 mb-6 text-white">Escrow Status</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">DevProof Hash:</span>
              <span className="truncate w-32 text-right text-gray-300">0x4f8A...a1b2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Asking Price:</span>
              <span className="text-white font-bold">2.5 ETH</span>
            </div>
            
            {/* Lock Funds Butonu */}
            <button 
              disabled={!wallet}
              className={`w-full font-bold px-4 py-3 rounded mt-8 border transition-colors flex justify-center items-center gap-2 ${
                wallet ? 'bg-blue-900 hover:bg-blue-800 text-white border-blue-500' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
              }`}
            >
              Lock 2.5 ETH & Reveal
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}