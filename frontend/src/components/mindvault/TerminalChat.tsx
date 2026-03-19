"use client";

import React, { useEffect, useRef } from "react";
import type { ChatMessage } from "../../lib/chat";

type Props = {
  messages: ChatMessage[];
  isLoading: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
};

export function TerminalChat({
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onSubmit,
  disabled,
}: Props) {
  const tailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tailRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  return (
    <div className="col-span-2 mv-card mv-terminal mv-fade-up p-4 min-h-[560px] h-[70vh] max-h-[720px] flex flex-col">
      <div
        className="border-b pb-3 mb-4 flex justify-between items-center"
        style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
          <span className="ml-3 text-xs text-emerald-200/55 mv-mono">
            root@tee-enclave:~# NDAI_SESSION_ACTIVE
          </span>
        </div>
        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 text-sm flex flex-col whitespace-pre-wrap mv-mono pr-2 mv-scroll">
        {messages.map((msg, idx) => {
          const msgClasses =
            msg.role === "user"
              ? "border-emerald-400/25 bg-emerald-400/5 text-emerald-50"
              : msg.role === "ai"
                ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-200"
                : "border-emerald-100/10 bg-black/10 text-emerald-100/55";

          return (
            <div key={idx} className={`rounded-lg border px-3 py-2 leading-relaxed ${msgClasses}`}>
              {msg.text}
            </div>
          );
        })}
        {isLoading && (
          <div className="rounded-lg border px-3 py-2 leading-relaxed border-emerald-200/15 bg-emerald-200/5 text-emerald-200 animate-pulse">
            {`> AI is analyzing the enclave...`}
          </div>
        )}
        <div ref={tailRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-4 flex gap-2 items-center border-t pt-4"
        style={{ borderColor: "rgba(52, 211, 153, 0.18)" }}
      >
        <span className="text-emerald-300 font-bold mv-mono">{`>`}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask the AI to analyze, or type 'approve the transaction'..."
          className="w-full bg-black/20 rounded-lg border px-3 py-2 focus:outline-none focus:border-emerald-400 text-emerald-100 placeholder-emerald-200/20 mv-mono"
          style={{ borderColor: "rgba(52, 211, 153, 0.22)" }}
          disabled={disabled || isLoading}
        />
        <button
          type="submit"
          className="mv-btn px-3 py-2 text-xs mv-mono"
          disabled={disabled || isLoading || !inputValue.trim()}
        >
          SEND
        </button>
      </form>
    </div>
  );
}
