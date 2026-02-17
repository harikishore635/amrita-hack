/**
 * PensionChain - Blockchain Setup & Deployment Script
 * 
 * This script:
 * 1. Checks if deployer wallet is already configured
 * 2. Verifies the wallet has testnet MATIC
 * 3. Deploys PensionVault contract to Polygon Amoy
 * 4. Updates .env.local with the contract address
 * 5. Verifies the deployment
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║       🚀 PensionChain Blockchain Setup               ║");
    console.log("║       Polygon Amoy Testnet (Chain ID: 80002)         ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Step 1: Check deployer wallet
    const [deployer] = await hre.ethers.getSigners();
    console.log("📋 Step 1: Deployer Wallet");
    console.log("   Address:", deployer.address);

    // Step 2: Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceMatic = hre.ethers.formatEther(balance);
    console.log("   Balance:", balanceMatic, "POL/MATIC\n");

    if (balance === 0n) {
        console.log("❌ Your deployer wallet has 0 MATIC!");
        console.log("");
        console.log("   You need testnet MATIC to deploy the contract.");
        console.log("   Get free testnet MATIC from ANY of these faucets:");
        console.log("");
        console.log("   1. https://faucet.polygon.technology/");
        console.log("   2. https://faucets.chain.link/polygon-amoy");
        console.log("   3. https://www.alchemy.com/faucets/polygon-amoy");
        console.log("");
        console.log(`   Paste this address: ${deployer.address}`);
        console.log("");
        console.log("   After funding, run this script again:");
        console.log("   npx hardhat run scripts/setup-blockchain.cjs --network amoy --config hardhat.config.js");
        process.exit(1);
    }

    // Step 3: Deploy contract
    console.log("📋 Step 2: Deploying PensionVault...");
    const PensionVault = await hre.ethers.getContractFactory("PensionVault");
    const vault = await PensionVault.deploy();
    await vault.waitForDeployment();

    const contractAddress = await vault.getAddress();
    console.log("   ✅ Deployed at:", contractAddress);
    console.log(`   🔗 Explorer: https://amoy.polygonscan.com/address/${contractAddress}\n`);

    // Step 4: Update .env.local
    console.log("📋 Step 3: Updating .env.local...");
    const envPath = path.join(__dirname, "..", ".env.local");
    let envContent = fs.readFileSync(envPath, "utf-8");

    // Replace or add CONTRACT_ADDRESS
    if (envContent.includes("CONTRACT_ADDRESS=")) {
        envContent = envContent.replace(/^CONTRACT_ADDRESS=.*$/m, `CONTRACT_ADDRESS=${contractAddress}`);
        // Also uncomment if commented
        envContent = envContent.replace(/^# ?CONTRACT_ADDRESS=.*$/m, `CONTRACT_ADDRESS=${contractAddress}`);
    } else if (envContent.includes("# CONTRACT_ADDRESS")) {
        envContent = envContent.replace(/^# CONTRACT_ADDRESS.*$/m, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
        envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("   ✅ .env.local updated with CONTRACT_ADDRESS\n");

    // Step 5: Verify
    console.log("📋 Step 4: Verifying deployment...");
    const contractBalance = await vault.getContractBalance();
    const owner = await vault.owner();
    console.log("   Contract balance:", hre.ethers.formatEther(contractBalance), "MATIC");
    console.log("   Owner:", owner);
    console.log("   Owner matches deployer:", owner === deployer.address);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║  ✅ BLOCKCHAIN SETUP COMPLETE!                       ║");
    console.log("╠════════════════════════════════════════════════════════╣");
    console.log(`║  Contract: ${contractAddress}  ║`);
    console.log(`║  Deployer: ${deployer.address}  ║`);
    console.log("║  Network:  Polygon Amoy (80002)                      ║");
    console.log("╠════════════════════════════════════════════════════════╣");
    console.log("║  Now run: npm run dev                                 ║");
    console.log("║  All contributions will be recorded on-chain! 🎉     ║");
    console.log("╚════════════════════════════════════════════════════════╝");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Setup failed:", error.message || error);
        process.exit(1);
    });
