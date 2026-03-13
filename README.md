# 🛡️ MindVault Protocol

> "Show the Proof, Hide the Logic." / "Kodu Gösterme, Mantığını Kanıtla."

MindVault is a decentralized Intellectual Property (IP) escrow protocol. It solves the "Inventor's Paradox" by using a Trusted Execution Environment (TEE) and an LLM agent as an incorruptible, non-disclosing referee.

## 🏗️ Architecture
This monorepo consists of three main pillars:
1. **Frontend (`/frontend`)**: Next.js 14 based UI with ASC (Anonymous Smart Credentials) integration for doxxing-free login.
2. **TEE Backend (`/tee-backend`)**: Python/FastAPI running inside a Dstack TEE. Implements the NDAI (Non-Disclosing AI) protocol to analyze code and selectively disclose proofs without leaking the source.
3. **Smart Contracts (`/contracts`)**: Solidity based Escrow contracts utilizing Oasis ROFL for secure state transitions and EIP-1271 for smart signature validation.

## 🚀 Hackathon Objectives (Shape Rotator)
- [x] Monorepo initialization
- [ ] Smart Contract architecture (Escrow & Settlement)
- [ ] TEE Backend (AI Agent & DevProof integration)
- [ ] Frontend integration (Wallet Connect & ASC)
- [ ] Oasis ROFL implementation for TEE-to-Blockchain messaging

---
*Developed for Shape Rotator Hackathon 2026.*