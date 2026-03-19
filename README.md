# 🛡️ MindVault Protocol

> *"Show the Proof, Hide the Logic."*

**MindVault Protocol** is a decentralized Intellectual Property (IP) escrow and selective-disclosure referee system. It solves the timeless "Inventor's Paradox" in software engineering by utilizing a Trusted Execution Environment (TEE) and an LLM Agent to broker zero-trust transactions between code developers and buyers.

Built for the **Shape Rotator Hackathon 2026**, MindVault transforms cutting-edge IC3 research papers into a fully functional, production-ready dApp.

---

## 🛑 The Problem: The Inventor's Paradox
When a developer writes a highly optimized algorithm or smart contract, selling it is a paradox:
- The buyer won't pay without seeing the code to verify its security and logic.
- The seller won't show the code without being paid, fearing intellectual property theft.
- **Result:** Deadlock. No trust, no trade.

## 💡 The Solution: MindVault AI Arbiter
MindVault acts as an incorruptible, non-disclosing referee.
1. The Seller uploads the code into a secure hardware enclave (TEE). The system generates a cryptographic **DevProof** hash.
2. The Buyer connects via an **Anonymous Smart Credential (ASC)** to prevent doxxing.
3. The Buyer interrogates the **NDAI (Non-Disclosing AI)** about the code's logic, performance, and security. The AI answers truthfully but *never* leaks the source code.
4. Once satisfied, the Buyer locks the funds in a Smart Contract. 
5. The AI signs a cryptographic release order (via **Oasis ROFL/EIP-1271**). The Smart Contract verifies the ECDSA signature, unlocks the funds for the seller, and transfers the IP to the buyer.

---

## 🏗️ Technical Architecture

| Pillar | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, Ethers.js, Tailwind | Inventor Dashboard & Buyer Terminal UI. Implements ASC logic for privacy-preserving wallet connections. |
| **TEE Backend** | Python, FastAPI, DeepSeek LLM | The Secure Enclave simulation. Handles DevProof generation, Strict NDAI Prompt Engineering, and ECDSA signature creation. |
| **Smart Contracts**| Solidity, Foundry, OpenZeppelin | The Escrow vault. Holds funds and executes conditional transfers based on TEE-verified cryptographic signatures. |

---

## 📚 Academic Foundations (IC3 Papers)
This project is a direct practical implementation of the following concepts:
* **NDAI (Non-Disclosing AI):** DeepSeek LLM is strictly prompt-engineered to perform "Selective Disclosure". It evaluates code vulnerabilities and logic without ever printing or leaking the raw source to the buyer.
* **ASC (Anonymous Smart Credentials):** The frontend masks the user's Web3 wallet address during the negotiation phase, ensuring high-stakes IP buyers are not doxxed while querying the AI.
* **Oasis ROFL (Runtime Ocall for Fetching computation Logs):** The TEE backend autonomously generates standard Ethereum ECDSA signatures based on AI consensus, directly triggering state changes on the blockchain.

---

## 🚀 How to Run Locally

### 1. Start the Local Blockchain (Anvil)
```bash
# Terminal 1
anvil
2. Deploy the Smart Contract
Bash
# Terminal 2
cd contracts
forge script script/DeployMindVault.s.sol:DeployMindVault --rpc-url [http://127.0.0.1:8545](http://127.0.0.1:8545) --broadcast
3. Start the TEE AI Engine
Bash
# Terminal 3
cd tee-backend
# Ensure .env has your DEEPSEEK_API_KEY
source venv/bin/activate
uvicorn main:app --reload
4. Launch the MindVault Interface
Bash
# Terminal 4
cd frontend
npm run dev
# Go to http://localhost:3000
Developed with focus on Clean Code, Cryptographic Security, and AI Engineering.
---
*Developed for Shape Rotator Hackathon 2026.*