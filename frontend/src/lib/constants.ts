// frontend/src/lib/constants.ts

// Hackathon için yerel ağda (Anvil/Hardhat) deploy edilen varsayılan ilk kontrat adresi.
// Gerçek ağa (Oasis Sapphire vb.) yüklediğimizde burayı değiştireceğiz.
export const ESCROW_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// Ethers.js için okunabilir (Human-Readable) ABI formatı.
// Sadece Frontend'in kullanacağı fonksiyonları tanımlamamız yeterlidir.
export const ESCROW_ABI = [
  // Alıcının parayı kilitlediği fonksiyon (payable olduğu için ETH gönderebiliriz)
  "function lockFunds() external payable",
  
  // TEE'den gelen imzayla parayı serbest bırakan fonksiyon
  "function releaseFundsWithSignature(bytes memory signature) external",
  
  // Kontratın güncel durumunu okumak için view fonksiyonları
  "function lockedAmount() external view returns (uint256)",
  "function isCompleted() external view returns (bool)"
];