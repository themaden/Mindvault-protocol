// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**

@title MindVaultEscrow

@dev The core escrow contract. Funds are locked by the buyer and

released to the seller ONLY when the TEE (AI Agent) provides a valid cryptographic signature.
*/
contract MindVaultEscrow {
// Addresses
address public seller;
address public buyer;
address public teeOracle; // Wallet address of the AI inside the TEE

// Financial Status
uint256 public lockedAmount;
bool public isCompleted;

// Events for the frontend (Next.js) to see transactions instantly
event FundsLocked(address indexed buyer, uint256 amount);
event FundsReleased(address indexed seller, uint256 amount);

/**

@dev Sets the seller and TEE address when the contract is created.
*/
constructor(address _seller, address _teeOracle) {
seller = _seller;
teeOracle = _teeOracle;
}

/**

@dev STAGE 1: Buyer locks the funds.

Only works if there are no funds in the contract.
*/
function lockFunds() external payable {
require(msg.value > 0, "Amount must be greater than 0");
require(lockedAmount == 0, "Funds already locked");

buyer = msg.sender;
lockedAmount = msg.value;

emit FundsLocked(buyer, msg.value);
}

/**

@dev STAGE 2: AI approves and funds are transferred to the seller.

Only the TEE address can call this function. Human intervention is prohibited.
*/
function releaseFunds() external {
require(msg.sender == teeOracle, "Only TEE AI can release funds");
require(lockedAmount > 0, "No funds to release");
require(!isCompleted, "Transaction already completed");

isCompleted = true;
uint256 amountToTransfer = lockedAmount;
lockedAmount = 0; // Zero out first to prevent reentrancy attacks

// Send funds to seller
(bool success, ) = seller.call{value: amountToTransfer}("");
require(success, "Transfer failed");

emit FundsReleased(seller, amountToTransfer);
}
}