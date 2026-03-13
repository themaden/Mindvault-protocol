// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title MindVaultEscrow
 * @dev Escrow contract using ECDSA signatures for TEE authorization.
 */
contract MindVaultEscrow {
    using ECDSA for bytes32;

    address public seller;
    address public buyer;
    address public teeOracle; // TEE's Public Key address

    uint256 public lockedAmount;
    bool public isCompleted;

    event FundsLocked(address indexed buyer, uint256 amount);
    event FundsReleased(address indexed seller, uint256 amount);

    constructor(address _seller, address _teeOracle) {
        seller = _seller;
        teeOracle = _teeOracle;
    }

    function lockFunds() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(lockedAmount == 0, "Funds already locked");
        
        buyer = msg.sender;
        lockedAmount = msg.value;
        
        emit FundsLocked(buyer, msg.value);
    }

    /**
     * @dev 3rd STAGE: Oasis ROFL Integration.
     * The AI signs a message. The identity of the sender of this signature (Relayer) does not matter.
     * What matters is that the signature belongs to the TEE.
     */
    function releaseFundsWithSignature(bytes memory signature) external {
        require(lockedAmount > 0, "No funds to release");
        require(!isCompleted, "Transaction already completed");

        // 1. Reconstruct the message signed by the TEE: "MindVault_Release_Funds" + Buyer Address
        bytes32 messageHash = keccak256(abi.encodePacked("MindVault_Release_Funds", buyer));
        
        // 2. Hash the message according to Ethereum standards (EIP-191)
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        // 3. Recover the signer's address from the signature (ecrecover)
        address signer = ethSignedMessageHash.recover(signature);

        // 4. VERIFY: Is the signer really our internal AI?
        require(signer == teeOracle, "Invalid TEE AI Signature");

        // 5. If everything is correct, transfer the funds (CEI Pattern)
        isCompleted = true;
        uint256 amountToTransfer = lockedAmount;
        lockedAmount = 0;

        (bool success, ) = seller.call{value: amountToTransfer}("");
        require(success, "Transfer failed");

        emit FundsReleased(seller, amountToTransfer);
    }
}