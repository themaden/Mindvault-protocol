// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MindVaultEscrow} from "../src/MindVaultEscrow.sol";

contract DeployMindVault is Script {
    function run() public {
        // Anvil'in bize sağladığı varsayılan 0 numaralı cüzdanın Private Key'i
        // (Bunu asla gerçek ağda kullanma, sadece yerel test içindir!)
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        // TEE Oracle Adresi (Python backend'imizin "startup" anında verdiği adres)
        address teeOracle = 0x1234567890123456789012345678901234567890; 

        // Yayın (Broadcast) başlatıyoruz. Bu noktadan sonraki her şey blokzincire kazınır.
        vm.startBroadcast(deployerPrivateKey);

        // Satıcı adresi olarak kontratı yükleyen kişiyi (kendimizi) belirliyoruz
        address seller = vm.addr(deployerPrivateKey); 

        // Ve muazzam kontratımız blokzincire doğuyor!
        MindVaultEscrow escrow = new MindVaultEscrow(seller, teeOracle);

        console.log("-----------------------------------------");
        console.log("MindVaultEscrow Deployed To:", address(escrow));
        console.log("Seller Address:", seller);
        console.log("TEE Oracle Address:", teeOracle);
        console.log("-----------------------------------------");

        vm.stopBroadcast();
    }
}