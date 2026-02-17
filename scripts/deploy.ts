const hre = require("hardhat");

async function main() {
  const ethers = hre.ethers;
  console.log("🚀 Deploying PensionVault to Polygon Amoy...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "MATIC\n");

  if (balance === 0n) {
    console.error("❌ Deployer has no MATIC! Get testnet MATIC from:");
    console.error("   https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Deploy PensionVault
  const PensionVault = await ethers.getContractFactory("PensionVault");
  const vault = await PensionVault.deploy();
  await vault.waitForDeployment();

  const contractAddress = await vault.getAddress();

  console.log("✅ PensionVault deployed!");
  console.log("   Contract Address:", contractAddress);
  console.log("   Network: Polygon Amoy (chainId: 80002)");
  console.log(`   Explorer: https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("\n📋 Add to your .env.local:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
