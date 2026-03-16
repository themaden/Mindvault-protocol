"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "../lib/constants";
import { INITIAL_MESSAGES, type ChatMessage } from "../lib/chat";
import { getErrorMessage } from "../lib/errors";
import { EscrowPanel } from "../components/mindvault/EscrowPanel";
import { TerminalChat } from "../components/mindvault/TerminalChat";

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
const VaultIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const ChipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  gold,
}: {
  label: string;
  value: string;
  sub?: string;
  gold?: boolean;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(10,21,24,0.9), rgba(6,14,16,0.95))",
        border: `1px solid ${gold ? "rgba(201,168,76,0.18)" : "rgba(0,255,135,0.1)"}`,
        borderRadius: "12px",
        padding: "0.85rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.2rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.6rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: gold ? "var(--gold-dim)" : "var(--text-muted)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: gold ? "var(--gold)" : "var(--phos)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--text-muted)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function Home() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_TEE_BACKEND_URL ?? "http://localhost:8000";
  const ASK_PRICE_ETH = "2.5";

  const [wallet, setWallet] = useState<string | null>(null);
  const [realAddress, setRealAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [releaseSignature, setReleaseSignature] = useState<string | null>(null);
  const [devProof, setDevProof] = useState<string | null>(null);

  const appendMessage = (message: ChatMessage) =>
    setMessages((prev) => [...prev, message]);
  const appendSystemLog = (text: string) =>
    appendMessage({ role: "system", text });

  const connectWallet = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) return alert("Please install MetaMask to use MindVault.");
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setRealAddress(address);
      setWallet(
        `Anon_${address.substring(0, 4)}...${address.substring(address.length - 4)}`
      );
    } catch (error: unknown) {
      console.error("Wallet connection failed:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userQuestion = inputValue.trim();
    if (!userQuestion) return;

    appendMessage({ role: "user", text: `> ${userQuestion}` });
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/ask-ndai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      let aiResponseText = `> ${data.agent_response}`;

      if (aiResponseText.includes("Ready to sign.")) {
        if (!realAddress)
          throw new Error(
            "Wallet address is missing. Please reconnect your wallet."
          );
        const sigResponse = await fetch(
          `${BACKEND_URL}/api/v1/sign-release`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyer_address: realAddress }),
          }
        );
        const sigData = await sigResponse.json();
        if (sigResponse.ok && sigData.signature) {
          setReleaseSignature(sigData.signature);
          aiResponseText += `\n\n[SYSTEM LOG: Cryptographic Signature Acquired: ${sigData.signature.substring(0, 20)}...]\n> You can now unlock the funds.`;
        }
      }

      appendMessage({ role: "ai", text: aiResponseText });
    } catch (error: unknown) {
      appendSystemLog(`> ERROR: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockFunds = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) return alert("MetaMask is not installed!");
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const escrowContract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );
      const tx = await escrowContract.lockFunds({
        value: ethers.parseEther(ASK_PRICE_ETH),
      });
      await tx.wait();
      appendSystemLog(`> ESCROW: Locked ${ASK_PRICE_ETH} ETH on-chain.`);
    } catch (error) {
      appendSystemLog(`> ERROR: ${getErrorMessage(error)}`);
    } finally {
      setIsTransactionPending(false);
    }
  };

  const handleReleaseFunds = async () => {
    const ethereum = window.ethereum;
    if (!ethereum || !releaseSignature) return;
    try {
      setIsTransactionPending(true);
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const escrowContract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );
      const tx = await escrowContract.releaseFundsWithSignature(releaseSignature);
      await tx.wait();
      appendSystemLog("> ESCROW: Deal completed. Signature verified, funds released.");
      setReleaseSignature(null);
    } catch (error) {
      appendSystemLog(`> ERROR: ${getErrorMessage(error)}`);
    } finally {
      setIsTransactionPending(false);
    }
  };

  const resetSession = () => {
    setMessages(INITIAL_MESSAGES);
    setReleaseSignature(null);
  };

  const enclaveStatus = devProof ? "LOCKED" : "EMPTY";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem 1.25rem 3rem",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <header className="mv-card mv-fade-up" style={{ padding: "1.75rem 2rem", marginBottom: "2rem" }}>

          {/* Top row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="mv-logomark">
                <VaultIcon />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  MindVault
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.2em",
                    color: "var(--gold-dim)",
                    textTransform: "uppercase",
                    marginTop: "0.3rem",
                  }}
                >
                  Protocol v2.0 — Show the Proof, Hide the Logic
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={connectWallet}
                className={`mv-btn ${wallet ? "" : "mv-btn-gold"}`}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ width: "14px", height: "14px", display: "inline-flex" }}>
                  <WalletIcon />
                </span>
                {wallet ? `${wallet}` : "Connect Wallet"}
              </button>

              <a href="/upload" className="mv-btn" style={{ textDecoration: "none" }}>
                Seller Dashboard
              </a>

              <button
                onClick={resetSession}
                className="mv-btn"
                style={{
                  borderColor: "rgba(0,255,135,0.08)",
                  color: "var(--text-muted)",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <StatCard
              label="Ask Price"
              value={`${ASK_PRICE_ETH} ETH`}
              sub="per session"
              gold
            />
            <StatCard
              label="Enclave"
              value={enclaveStatus}
              sub={devProof ? "TEE active" : "awaiting code"}
            />
            <StatCard
              label="Signature"
              value={releaseSignature ? "READY" : "PENDING"}
              sub={releaseSignature ? "ready to release" : "needs AI approval"}
              gold={Boolean(releaseSignature)}
            />
            <div
              style={{
                background: "linear-gradient(145deg, rgba(10,21,24,0.9), rgba(6,14,16,0.95))",
                border: "1px solid rgba(0,255,135,0.1)",
                borderRadius: "12px",
                padding: "0.85rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Endpoint
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {BACKEND_URL}
              </p>
              <div className="mv-status mv-status-active" style={{ marginTop: "2px" }}>
                <span className="mv-status-dot" />
                <span style={{ color: "var(--phos-dim)" }}>online</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN GRID ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(280px, 360px)",
            gap: "1.5rem",
            alignItems: "start",
          }}
          className="mv-fade-up-1"
        >
          {/* Left: Terminal */}
          <div>
            {/* Section label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ width: "18px", height: "18px", color: "var(--phos)", display: "inline-flex" }}>
                <ChipIcon />
              </span>
              <p className="mv-panel-label" style={{ margin: 0 }}>
                NDAI Terminal — Trusted Execution Environment
              </p>
            </div>

            <div className="mv-card mv-glow-green">
              <TerminalChat
                messages={messages}
                isLoading={isLoading}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSubmit={handleSendMessage}
                disabled={!wallet}
              />

              {!wallet && (
                <div
                  style={{
                    padding: "0.75rem 1.25rem",
                    background: "rgba(0,0,0,0.2)",
                    borderTop: "1px solid rgba(0,255,135,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--text-muted)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ⚠ Connect wallet to unlock the terminal
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Escrow Panel */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ width: "18px", height: "18px", color: "var(--gold)", display: "inline-flex" }}>
                <ShieldIcon />
              </span>
              <p className="mv-panel-label" style={{ margin: 0 }}>
                On-Chain Escrow — Smart Contract
              </p>
            </div>

            <div className="mv-card mv-glow-gold">
              <EscrowPanel
                askPriceEth={ASK_PRICE_ETH}
                devProof={devProof}
                releaseSignature={releaseSignature}
                walletConnected={Boolean(wallet)}
                isTransactionPending={isTransactionPending}
                onLockFunds={handleLockFunds}
                onReleaseFunds={handleReleaseFunds}
                backendUrl={BACKEND_URL}
                onDevProof={setDevProof}
                onSystemLog={appendSystemLog}
              />
            </div>
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer
          style={{
            marginTop: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
          className="mv-fade-up-4"
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
            }}
          >
            © 2024 MindVault Protocol — Powered by NDAI & ASC
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span className="mv-badge">TEE / Oasis ROFL</span>
            <span className="mv-badge mv-badge-gold">Escrow v1.0</span>
          </div>
        </footer>
      </div>
    </main>
  );
}