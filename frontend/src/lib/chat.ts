export type ChatRole = "system" | "ai" | "user";
export type ChatMessage = { role: ChatRole; text: string };

export const INITIAL_MESSAGES: ChatMessage[] = [
  { role: "system", text: "> System initialized inside Trusted Execution Environment (Dstack)." },
  { role: "system", text: "> Verifying remote attestation... OK." },
  {
    role: "ai",
    text: "> Hello. I am the MindVault Arbiter. The seller has locked the codebase. Ask me anything about its logic or security.",
  },
];

