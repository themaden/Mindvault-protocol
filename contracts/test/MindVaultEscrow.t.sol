// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {MindVaultEscrow} from "../src/MindVaultEscrow.sol";
import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

contract MindVaultEscrowTest is Test {
    MindVaultEscrow public escrow;
    
    // Mock addresses for our actors
    address public seller = address(0x1);
    address public buyer = address(0x2);
    uint256 private teeOraclePrivateKey = 0xBEEF;
    address public teeOracle;

    function setUp() public {
        teeOracle = vm.addr(teeOraclePrivateKey);
        // Deploy the contract before each test is executed
        escrow = new MindVaultEscrow(seller, teeOracle);
        
        // Fund the buyer wallet with 10 test ETH
        vm.deal(buyer, 10 ether);
    }

    function test_LockFunds() public {
        // Simulate the buyer calling the contract
        vm.prank(buyer);
        
        // Buyer locks 1 ETH in the escrow
        escrow.lockFunds{value: 1 ether}();
        
        // Verify the state changes
        assertEq(escrow.lockedAmount(), 1 ether);
        assertEq(escrow.buyer(), buyer);
    }

    function test_ReleaseFundsByTEE() public {
        // Step 1: Buyer locks funds
        vm.prank(buyer);
        escrow.lockFunds{value: 2 ether}();

        uint256 initialSellerBalance = seller.balance;

        // Step 2: Simulate the TEE AI (Oracle) approving by signing the expected message.
        bytes32 messageHash = keccak256(abi.encodePacked("MindVault_Release_Funds", buyer));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(teeOraclePrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Relayer identity does not matter; signature authenticity does.
        escrow.releaseFundsWithSignature(signature);

        // Step 3: Verify the seller received the funds and escrow is empty
        assertEq(seller.balance, initialSellerBalance + 2 ether);
        assertEq(escrow.lockedAmount(), 0);
        assertTrue(escrow.isCompleted());
    }

    function test_RevertIf_UnauthorizedRelease() public {
        // Buyer locks funds
        vm.prank(buyer);
        escrow.lockFunds{value: 1 ether}();

        // A malicious hacker tries to release the funds with an invalid signature.
        uint256 hackerPrivateKey = 0xCAFE;
        bytes32 messageHash = keccak256(abi.encodePacked("MindVault_Release_Funds", buyer));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(hackerPrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.expectRevert("Invalid TEE AI Signature");
        escrow.releaseFundsWithSignature(signature);
    }
}
