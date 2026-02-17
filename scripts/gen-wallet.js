// Generate a deployer wallet for PensionChain
const crypto = require('crypto');

// Generate random private key
const privateKey = '0x' + crypto.randomBytes(32).toString('hex');

// Compute address from private key using ethers-compatible approach
// For simplicity, let's just output the private key - we'll get the address from Hardhat
console.log('=== PensionChain Deployer Wallet ===');
console.log('DEPLOYER_PRIVATE_KEY=' + privateKey);
console.log('');
console.log('Add the above to your .env.local file.');
console.log('Then fund this wallet with test MATIC from https://faucet.polygon.technology/');
