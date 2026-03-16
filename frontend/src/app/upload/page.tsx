"use client";

import React, { useState } from "react";
import { CopyField } from "../../components/mindvault/CopyField";
import { getErrorMessage } from "../../lib/errors";

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const HashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

/* ─── Step indicator ─────────────────────────────────────────────────────── */
function Step({
  num,
  label,
  active,
  done,
}: {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        opacity: done || active ? 1 : 0.35,
      }}
    >
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          border: `1px solid ${done ? "var(--phos)" : active ? "var(--gold)" : "rgba(0,255,135,0.2)"}`,
          background: done
            ? "rgba(0,255,135,0.1)"
            : active
            ? "rgba(201,168,76,0.08)"
            : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.3s ease",
        }}
      >
        {done ? (
          <span style={{ width: "12px", height: "12px", color: "var(--phos)", display: "inline-flex" }}>
            <CheckIcon />
          </span>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              fontWeight: 700,
              color: active ? "var(--gold)" : "var(--text-muted)",
            }}
          >
            {num}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: done ? "var(--phos-dim)" : active ? "var(--gold)" : "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Upload Page ────────────────────────────────────────────────────────── */
export default function UploadPage() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_TEE_BACKEND_URL ?? "http://localhost:8000";

  const [sourceCode, setSourceCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [devProof, setDevProof] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceCode(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/upload-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: sourceCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed");
      setDevProof(data.dev_proof);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const step1Done = Boolean(sourceCode.trim());
  const step2Done = isUploading || Boolean(devProof);
  const step3Done = Boolean(devProof);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem 1.25rem 3rem",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <header
          className="mv-card mv-fade-up"
          style={{ padding: "1.75rem 2rem", marginBottom: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                className="mv-logomark"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(0,255,135,0.06))",
                  borderColor: "rgba(201,168,76,0.2)",
                }}
              >
                <span style={{ color: "var(--gold)", display: "inline-flex", width: "22px", height: "22px" }}>
                  <CodeIcon />
                </span>
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.4rem, 3vw, 2rem)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  Inventor Dashboard
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
                  Upload your logic — Lock it in the Enclave
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                className={`mv-status ${devProof ? "mv-status-active" : "mv-status-idle"}`}
              >
                <span className="mv-status-dot" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.12em",
                    color: devProof ? "var(--phos)" : "var(--text-muted)",
                  }}
                >
                  {devProof ? "LOCKED" : "READY"}
                </span>
              </div>
              <a href="/" className="mv-btn" style={{ textDecoration: "none" }}>
                ← Buyer Terminal
              </a>
            </div>
          </div>

          {/* Step progress */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(0,255,135,0.07)",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <Step num={1} label="Paste your code" active={!step1Done} done={step1Done} />
            <Step num={2} label="Lock in enclave" active={step1Done && !step2Done} done={step2Done} />
            <Step num={3} label="Share DevProof" active={step2Done && !step3Done} done={step3Done} />
          </div>
        </header>

        {/* ── EDITOR CARD ──────────────────────────────────────────────── */}
        <div className="mv-card mv-fade-up-1" style={{ overflow: "visible" }}>

          {/* Card header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem 1.25rem",
              background: "rgba(0,0,0,0.2)",
              borderBottom: "1px solid rgba(0,255,135,0.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,69,96,0.6)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,189,46,0.6)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(0,255,135,0.5)" }} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--text-muted)",
                  marginLeft: "0.5rem",
                  letterSpacing: "0.08em",
                }}
              >
                secure_enclave.sol
              </span>
            </div>
            {charCount > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--text-muted)",
                }}
              >
                {charCount.toLocaleString()} chars
              </span>
            )}
          </div>

          {/* Code editor */}
          <div style={{ padding: "0" }}>
            <textarea
              value={sourceCode}
              onChange={handleCodeChange}
              placeholder={
                "// Paste your highly confidential code here...\n// e.g. contract SuperSecretLogic {\n//   function reveal() external { ... }\n// }"
              }
              disabled={devProof !== null || isUploading}
              style={{
                display: "block",
                width: "100%",
                minHeight: "340px",
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "1.25rem 1.5rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                lineHeight: "1.8",
                color: "var(--phos-text)",
                resize: "vertical",
                opacity: devProof ? 0.45 : 1,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                margin: "0 1.25rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,69,96,0.3)",
                background: "rgba(127,29,29,0.15)",
                padding: "0.6rem 0.9rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "rgba(255,120,140,0.9)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: "var(--danger)" }}>ERR:</span> {error}
            </div>
          )}

          {/* Action bar */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderTop: "1px solid rgba(0,255,135,0.07)",
              background: "rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className="mv-badge">AES-256 in-memory</span>
              <span className="mv-badge">SHA-3 DevProof</span>
              <span className="mv-badge mv-badge-gold">TEE isolated</span>
            </div>

            <button
              onClick={handleUpload}
              disabled={devProof !== null || isUploading || !sourceCode.trim()}
              className={`mv-btn ${devProof ? "" : "mv-btn-gold"}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.5rem",
                minWidth: "200px",
                justifyContent: "center",
              }}
            >
              <span style={{ width: "14px", height: "14px", display: "inline-flex" }}>
                {devProof ? <CheckIcon /> : <UploadIcon />}
              </span>
              {isUploading
                ? "Uploading to enclave..."
                : devProof
                ? "Code Locked"
                : "Lock Code & Generate DevProof"}
            </button>
          </div>
        </div>

        {/* ── DEV PROOF RESULT ──────────────────────────────────────────── */}
        {devProof && (
          <div
            className="mv-card mv-glow-green mv-fade-up"
            style={{ marginTop: "1.5rem", padding: "1.5rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(0,255,135,0.08)",
                  border: "1px solid rgba(0,255,135,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ width: "20px", height: "20px", color: "var(--phos)", display: "inline-flex" }}>
                  <HashIcon />
                </span>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "0.04em",
                  }}
                >
                  DevProof Generated
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.25rem",
                    lineHeight: 1.5,
                  }}
                >
                  Your code is now sealed in the enclave. Share this hash with buyers — it
                  cryptographically identifies the exact logic they're purchasing.
                </p>
              </div>
            </div>

            <CopyField label="Dev Proof" value={devProof} />

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.6rem",
                flexWrap: "wrap",
              }}
            >
              <span className="mv-badge">
                Enclave: Active
              </span>
              <span className="mv-badge">
                Hash verified
              </span>
              <span className="mv-badge mv-badge-gold">
                Ready for buyers
              </span>
            </div>
          </div>
        )}

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
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
            }}
          >
            © 2024 MindVault Protocol — Inventor Dashboard
          </p>
          <span className="mv-badge mv-badge-gold">Oasis ROFL</span>
        </footer>
      </div>
    </main>
  );
}