// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MindVaultEscrow} from "../src/MindVaultEscrow.sol";

contract DeployMindVault is Script {
    function run() public {

        // Private key of the default wallet (index 0) provided by Anvil
        // (Never use this on a real network, it is only for local testing!)
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        // TEE Oracle Address (the address given by our Python backend during startup)
        address teeOracle = 0x1234567890123456789012345678901234567890;

        // We start the broadcast. Everything after this point will be written to the blockchain.
        vm.startBroadcast(deployerPrivateKey);

        // We set the seller address as the person deploying the contract (ourselves)
        address seller = vm.addr(deployerPrivateKey);

        // And our magnificent contract is born on the blockchain!
        MindVaultEscrow escrow = new MindVaultEscrow(seller, teeOracle);

        console.log("-----------------------------------------");
        console.log("MindVaultEscrow Deployed To:", address(escrow));
        console.log("Seller Address:", seller);
        console.log("TEE Oracle Address:", teeOracle);
        console.log("-----------------------------------------");

        vm.stopBroadcast();
    }
}