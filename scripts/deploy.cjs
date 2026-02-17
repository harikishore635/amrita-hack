// Deploy PensionVault to Polygon Amoy Testnet
const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying PensionVault to Polygon Amoy...\n");

    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(balance), "MATIC\n");

    if (balance === 0n) {
        console.error("❌ Deployer has no MATIC! Get testnet MATIC from:");
        console.error("   https://faucet.polygon.technology/");
        process.exit(1);
    }

    // Deploy PensionVault
    const PensionVault = await hre.ethers.getContractFactory("PensionVault");
    const vault = await PensionVault.deploy();
    await vault.waitForDeployment();

    const contractAddress = await vault.getAddress();

    console.log("✅ PensionVault deployed!");
    console.log("   Contract Address:", contractAddress);
    console.log("   Network: Polygon Amoy (chainId: 80002)");
    console.log(`   Explorer: https://amoy.polygonscan.com/address/${contractAddress}`);
    console.log("\n📋 Add to your .env.local:");
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);

    // Save to file for easy use
    const fs = require('fs');
    fs.writeFileSync('_deployed.txt', contractAddress);
    console.log('\n✅ Contract address saved to _deployed.txt');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error.message || error);
        process.exit(1);
    });
