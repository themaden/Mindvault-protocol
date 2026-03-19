"use client";

import React, { useState } from "react";

type CopyStatus = "idle" | "copied" | "error";

type Props = {
  label: string;
  value: string;
};

export function CopyField({ label, value }: Props) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1200);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  };

  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{ borderColor: "rgba(52, 211, 153, 0.18)", background: "rgba(0,0,0,0.12)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-emerald-100/60 mv-mono">{label}</span>
        <button
          type="button"
          className="mv-btn px-3 py-1 text-xs mv-mono"
          onClick={handleCopy}
        >
          {status === "copied" ? "COPIED" : "COPY"}
        </button>
      </div>
      <div className="mt-2 text-xs text-emerald-100/75 break-all mv-mono">{value}</div>
      {status === "error" && (
        <div className="mt-2 text-xs text-red-200/90 mv-mono">
          Copy failed
        </div>
      )}
    </div>
  );
}