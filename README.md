# 🧠 MindVault Protocol
> **Zero-Trust IP Escrow via Trusted Execution Environments (TEE) & NDAI**
> *Built for the Shape Rotator Hackathon 2026*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Status: Proof of Concept](https://img.shields.io/badge/Status-Proof_of_Concept-success.svg)]()

MindVault Protocol is a decentralized, zero-trust cryptographic escrow system designed to solve the **Inventor's Paradox** (Arrow's Information Paradox) in the Web3 space. By leveraging Trusted Execution Environments (TEEs) and Non-Disclosing AI (NDAI), MindVault allows developers to prove the value, security, and logic of their proprietary code (e.g., MEV bots, alpha trading algorithms) without ever revealing the raw source code to the buyer.

---

## 📑 Table of Contents
1. [The Core Problem](#-the-core-problem-arrows-information-paradox)
2. [The MindVault Solution](#-the-mindvault-solution)
3. [System Architecture](#-system-architecture--workflow)
4. [Key Features](#-key-features)
5. [Technology Stack](#-technology-stack)
6. [API Reference](#-api-reference-tee-backend)
7. [Running Locally](#-running-locally)
8. [Future Roadmap](#-future-roadmap)

---

## 📖 The Core Problem: Arrow's Information Paradox
In the highly lucrative world of Web3, developers constantly create highly profitable proprietary algorithms (MEV bots, arbitrage strategies, yield optimizers). However, selling this Intellectual Property (IP) introduces a fundamental economic problem known as **Arrow's Information Paradox**:

* **The Seller's Dilemma:** If the seller reveals the code to the buyer to prove it actually works and is secure, the buyer can simply steal the code without paying.
* **The Buyer's Dilemma:** If the seller refuses to reveal the code, the buyer cannot verify its security (e.g., hidden backdoors, reentrancy vectors) and will logically refuse to purchase it.

Currently, the market relies on centralized, trusted middlemen to audit and hold code in escrow, which contradicts the decentralized ethos of Web3.

---

## 💡 The MindVault Solution
MindVault eliminates the need for human trust by introducing a **Cryptographic AI Referee**. We combine the hardware-level security of TEEs with the analytical power of Large Language Models (LLMs) to create an incorruptible escrow system.

### The 3 Pillars of MindVault:
1. **Secure Enclave Vault (Dstack/Intel TDX):** The inventor's source code is uploaded directly into a hardware-isolated environment. It never touches a public server.
2. **NDAI (Non-Disclosing AI):** An AI agent acting under strict "Selective Disclosure" protocols. It analyzes the locked code and answers the buyer's questions without ever leaking the raw logic.
3. **Oasis ROFL Integration:** Once the AI and the buyer approve the transaction, the TEE generates a verifiable ECDSA signature. The on-chain smart contract verifies this signature to trustlessly release the locked funds.

---

## 🏗️ System Architecture & Workflow

The protocol operates in a strictly defined, 5-step lifecycle:

1. **Commitment:** The Seller (Inventor) uploads their proprietary Solidity/Rust code to the MindVault UI.
2. **Lock & Hash:** The Python backend (simulating a TEE) hashes the code to generate a cryptographic `DevProof` (SHA-256) and locks the raw code in memory.
3. **Interrogation:** The Buyer connects via ASC (Anonymous Smart Credentials) to mask their wallet address. They use the chat interface to ask the NDAI agent about vulnerabilities (e.g., "Is there a reentrancy vulnerability?").
4. **Selective Disclosure:** The LLM evaluates the hidden code and provides analytical answers while strictly refusing prompt-injection attempts to leak the code.
5. **Trustless Settlement:** The Buyer locks the agreed-upon ETH in the Escrow Smart Contract. If the AI detects no malicious backdoors and the buyer approves, the TEE generates an ECDSA signature. The smart contract validates the signature and transfers the IP ownership and funds.

---

## ✨ Key Features

* **Anonymous Smart Credentials (ASC):** Buyers and sellers interact using masked wallet identities to prevent on-chain doxxing during high-stakes IP negotiations.
* **Cryptographic DevProofs:** Sellers can publicly prove they wrote a specific version of an algorithm using time-stamped SHA-256 hashes.
* **Prompt-Engineered Defense:** The NDAI is fortified against prompt-injection attacks, ensuring the raw source code remains an absolute secret.
* **Zero-Trust Escrow:** No centralized party holds the funds; everything is governed by smart contracts and cryptographic signatures.

---

## 🛠️ Technology Stack

We carefully selected our stack to balance performance, AI capabilities, and Web3 integration:

### Frontend (Client-Side)
* **Framework:** Next.js (React)
* **Styling:** TailwindCSS (Hacker-themed, dark mode UI)
* **Blockchain Interaction:** Web3.js / Ethers.js (Simulated for Prototype)

### TEE Backend (Oracle & AI Engine)
* **Server:** FastAPI (Python) for asynchronous, high-performance API routing.
* **AI Engine:** DeepSeek API (`deepseek-chat`). Chosen for its strict adherence to system prompts and deep analytical reasoning in code evaluation.
* **Cryptography:** `web3.py` and `eth_account` for generating ECDSA signatures from the simulated TEE private key.
* **Hashing:** Python `hashlib` for generating DevProofs.

### Smart Contracts (Simulated)
* **Environment:** Foundry / Anvil (Localhost Ethereum network)
* **Language:** Solidity `^0.8.19`

---

## 🔌 API Reference (TEE-Backend)

The FastAPI backend exposes the following critical endpoints for the enclave:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Returns the health status of the TEE and DeepSeek API connection. |
| `/api/v1/upload-code` | `POST` | Locks the proprietary code in the enclave and returns a SHA-256 DevProof. |
| `/api/v1/ask-ndai` | `POST` | Passes buyer questions to the LLM alongside the hidden code for Selective Disclosure. |
| `/api/v1/sign-release` | `POST` | Generates the Oasis ROFL ECDSA signature to unlock funds on-chain. |

---

## 🚀 Running Locally

To test the MindVault Protocol prototype on your local machine, follow these steps:

### 1. Setup the TEE-Backend
Navigate to the backend directory, install dependencies, and run the server:
```bash
cd tee-backend
# Ensure you have a .env file with DEEPSEEK_API_KEY=your_key
pip install fastapi uvicorn web3 eth-account openai pydantic python-dotenv
uvicorn main:app --reload

The TEE API will run on http://localhost:8000

2. Setup the Frontend
Open a new terminal, navigate to the frontend directory, and start the Next.js app:

Bash
cd frontend
npm install
npm run dev
The UI will be accessible at http://localhost:3000

3. Demo Flow
Go to http://localhost:3000/upload to lock the mock AlphaMEVStrategy contract.

You will be redirected to the Dashboard to simulate the NDAI interrogation and Escrow lock.

🗺️ Future Roadmap
While this project was built as a Proof of Concept for the Shape Rotator Hackathon, our vision for MindVault extends much further:

Q3 2026: Migrate from simulated TEEs to actual hardware enclaves (Intel TDX / AMD SEV) using the Dstack framework.

Q4 2026: Deploy the Escrow Smart Contracts to Ethereum Mainnet and Arbitrum.

Q1 2027: Implement Zero-Knowledge Proofs (ZKPs) alongside TEEs to mathematically prove the absence of backdoors without relying entirely on AI.

Q2 2027: Expand NDAI support for Rust (Solana/Polkadot) and Move (Aptos/Sui) smart contracts.

Built with 💻 and ☕ by Yasin Maden.


***