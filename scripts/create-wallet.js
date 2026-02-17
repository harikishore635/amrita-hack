/**
 * PensionChain - Deployer Wallet Generator
 * Run: node scripts/create-wallet.js
 * 
 * Generates a random Ethereum-compatible private key + address.
 * Copy the output into your .env.local file.
 */

const crypto = require('crypto');

// Generate 32 random bytes → 64 hex chars private key
const privateKey = '0x' + crypto.randomBytes(32).toString('hex');

// Derive public address from private key using basic keccak256
// For a proper derivation we use ethers if available, otherwise show the key
try {
    // Try using ethers v6 if installed
    const { Wallet } = require('ethers');
    const wallet = new Wallet(privateKey);
    
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║          🔑  PensionChain Deployer Wallet  🔑              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log(`  PRIVATE KEY (keep secret!):`);
    console.log(`  ${privateKey}`);
    console.log('');
    console.log(`  WALLET ADDRESS (public):`);
    console.log(`  ${wallet.address}`);
    console.log('║                                                              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Add to .env.local:                                          ║');
    console.log(`  DEPLOYER_PRIVATE_KEY=${privateKey}`);
    console.log(`  DEPLOYER_ADDRESS=${wallet.address}`);
    console.log('║                                                              ║');
    console.log('║  ⚠️  Fund this address with test MATIC from:                ║');
    console.log('║  https://faucet.polygon.technology/  (Amoy Testnet)         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
} catch {
    // Fallback if ethers not yet installed
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║          🔑  PensionChain Deployer Wallet  🔑              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('');
    console.log(`  PRIVATE KEY: ${privateKey}`);
    console.log('');
    console.log('  ⚠️  Install ethers first to derive the address:');
    console.log('  npm install ethers');
    console.log('  Then re-run: node scripts/create-wallet.js');
    console.log('');
    console.log('╚══════════════════════════════════════════════════════════════╝');
}
