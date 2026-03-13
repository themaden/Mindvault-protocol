# tee-backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import hashlib
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct

app = FastAPI(title="MindVault TEE AI Agent", version="1.0.0")

# --- MOCK TEE ENCLAVE CRYPTOGRAPHY ---
# WARNING: In a real Oasis ROFL environment, this key is generated securely inside the enclave.
# For hackathon purposes, we use a static mock private key.
TEE_PRIVATE_KEY = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
tee_account = Account.from_key(TEE_PRIVATE_KEY)

secure_enclave = {
    "code_content": None,
    "dev_proof_hash": None,
    "is_locked": False,
    "ai_approved": False # Yapay zeka onay verdi mi?
}

# --- DATA MODELS ---
class CodeUpload(BaseModel):
    source_code: str

class AskQuestion(BaseModel):
    question: str

class ReleaseRequest(BaseModel):
    buyer_address: str

# --- ENDPOINTS ---

@app.on_event("startup")
async def startup_event():
    print(f"[*] TEE Oracle Address (Deploy Smart Contract with this!): {tee_account.address}")

@app.post("/api/v1/upload-code", summary="Seller uploads code to TEE")
async def upload_code_to_enclave(payload: CodeUpload):
    # ... (Buradaki kodlar aynı kalacak) ...
    if secure_enclave["is_locked"]:
        raise HTTPException(status_code=400, detail="Enclave is already locked with a codebase.")
    
    secure_enclave["code_content"] = payload.source_code
    encoded_code = payload.source_code.encode('utf-8')
    dev_proof = hashlib.sha256(encoded_code).hexdigest()
    
    secure_enclave["dev_proof_hash"] = dev_proof
    secure_enclave["is_locked"] = True
    
    return {
        "status": "success",
        "dev_proof": f"0x{dev_proof}"
    }

@app.post("/api/v1/ask-ndai", summary="Buyer asks questions (Selective Disclosure)")
async def ask_ndai_agent(payload: AskQuestion):
    # ... (Buradaki kodlar aynı kalacak) ...
    if not secure_enclave["is_locked"]:
        raise HTTPException(status_code=400, detail="No code loaded.")
    
    # MOCK LLM ANALYSIS
    question = payload.question.lower()
    if "approve" in question or "looks good" in question:
        secure_enclave["ai_approved"] = True
        return {"agent_response": "I have verified the code based on your requirements. I am ready to sign the release transaction."}
        
    return {"agent_response": "Analysis complete. The code logic is sound. Ask me to approve if you are satisfied."}

@app.post("/api/v1/sign-release", summary="Oasis ROFL Signature Generation")
async def generate_release_signature(payload: ReleaseRequest):
    """
    Step 3: If the AI has approved the code, it generates an ECDSA signature.
    This signature can be submitted to the Smart Contract by anyone to release funds.
    """
    if not secure_enclave["ai_approved"]:
        raise HTTPException(status_code=403, detail="AI has not approved the transaction yet.")
    
    try:
        buyer_checksum_address = Web3.to_checksum_address(payload.buyer_address)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Ethereum address format.")

    # 1. Recreate the exact same hash as Solidity: keccak256(abi.encodePacked("MindVault_Release_Funds", buyer))
    message_hash = Web3.solidity_keccak(
        ['string', 'address'],
        ['MindVault_Release_Funds', buyer_checksum_address]
    )
    
    # 2. Add Ethereum standard prefix (EIP-191)
    signable_message = encode_defunct(primitive=message_hash)
    
    # 3. Sign the message with TEE's private key
    signed_message = Account.sign_message(signable_message, private_key=TEE_PRIVATE_KEY)
    
    return {
        "status": "success",
        "message": "Signature generated successfully. Submit this to the Smart Contract.",
        "tee_oracle_address": tee_account.address,
        "signature": signed_message.signature.hex()
    }