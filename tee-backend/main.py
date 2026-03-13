# tee-backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import hashlib

app = FastAPI(title="MindVault TEE AI Agent", version="1.0.0")

# --- MOCK TEE ENCLAVE STORAGE ---
# In a real Dstack/Oasis environment, this memory is hardware-encrypted.
secure_enclave = {
    "code_content": None,
    "dev_proof_hash": None,
    "is_locked": False
}

# --- DATA MODELS ---
class CodeUpload(BaseModel):
    source_code: str

class AskQuestion(BaseModel):
    question: str

# --- ENDPOINTS ---

@app.post("/api/v1/upload-code", summary="Seller uploads code to TEE")
async def upload_code_to_enclave(payload: CodeUpload):
    """
    Step 1: Seller uploads the code. 
    The TEE immediately hashes it to create a 'DevProof' and locks the memory.
    """
    if secure_enclave["is_locked"]:
        raise HTTPException(status_code=400, detail="Enclave is already locked with a codebase.")
    
    # Store code securely (in memory)
    secure_enclave["code_content"] = payload.source_code
    
    # Generate cryptographic DevProof (SHA-256 Hash)
    encoded_code = payload.source_code.encode('utf-8')
    dev_proof = hashlib.sha256(encoded_code).hexdigest()
    
    secure_enclave["dev_proof_hash"] = dev_proof
    secure_enclave["is_locked"] = True
    
    return {
        "status": "success",
        "message": "Code securely locked inside TEE.",
        "dev_proof": f"0x{dev_proof}"
    }

@app.post("/api/v1/ask-ndai", summary="Buyer asks questions (Selective Disclosure)")
async def ask_ndai_agent(payload: AskQuestion):
    """
    Step 2: NDAI Implementation. 
    The AI analyzes the code but NEVER reveals the raw source.
    """
    if not secure_enclave["is_locked"]:
        raise HTTPException(status_code=400, detail="No code is currently loaded in the TEE.")
    
    question = payload.question.lower()
    
    # SECURITY MEASURE: Prevent prompt injection trying to leak the code
    forbidden_words = ["show me", "print", "display", "give me the code", "source code", "return code"]
    if any(word in question for word in forbidden_words):
        return {
            "agent_response": "ACCESS DENIED. NDAI Protocol strictly forbids leaking raw source code. Please ask about logic, security, or performance metrics."
        }
    
    # MOCK LLM ANALYSIS (In a real app, we pass secure_enclave["code_content"] to OpenAI/Local LLM here)
    # For hackathon demonstration, we use keyword-based mock responses based on the secret code.
    
    code = secure_enclave["code_content"].lower()
    response = "I have analyzed the code. Can you be more specific?"

    if "security" in question or "vulnerability" in question or "backdoor" in question:
        if "selfdestruct" in code or "tx.origin" in code:
            response = "WARNING: I detected critical vulnerabilities (potential selfdestruct or tx.origin usage) in the smart contract logic."
        else:
            response = "SECURITY CHECK PASSED. I found no obvious reentrancy or backdoor patterns in the analyzed logic."
            
    elif "performance" in question or "loop" in question:
        if "for" in code or "while" in code:
            response = "The logic contains iterative loops. Gas consumption might be high depending on the array size."
        else:
            response = "The logic is largely O(1) and does not contain unbounded loops. It is highly optimized."

    return {
        "dev_proof": f"0x{secure_enclave['dev_proof_hash']}",
        "agent_response": response
    }