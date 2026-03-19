// frontend/src/lib/constants.ts

const LOCAL_ESCROW_FALLBACK_ADDRESSES = [
  "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", // Foundry default local deploy
  "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat default local deploy
];

export const ESCROW_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ?? LOCAL_ESCROW_FALLBACK_ADDRESSES[0];

export const ESCROW_ADDRESS_CANDIDATES = [
  ESCROW_CONTRACT_ADDRESS,
  ...LOCAL_ESCROW_FALLBACK_ADDRESSES.filter(
    (address) => address.toLowerCase() !== ESCROW_CONTRACT_ADDRESS.toLowerCase(),
  ),
];

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
