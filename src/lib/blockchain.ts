/**
 * PensionChain - Blockchain Service Layer
 * 
 * Server-side only. Uses a single Deployer Wallet to sign all transactions
 * (custodial/relayer model — no MetaMask required for users).
 * 
 * Network: Polygon Amoy Testnet (chainId: 80002)
 */
import { ethers, JsonRpcProvider, Wallet, Contract, parseEther, formatEther } from 'ethers';
import { PENSION_VAULT_ABI } from './contract-abi';

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ─────────────────────────────────────────────
// Singleton instances (reused across requests)
// ─────────────────────────────────────────────
let _provider: JsonRpcProvider | null = null;
let _wallet: Wallet | null = null;
let _contract: Contract | null = null;

function getProvider(): JsonRpcProvider {
  if (!_provider) {
    _provider = new JsonRpcProvider(RPC_URL, {
      name: 'polygon-amoy',
      chainId: 80002,
    });
  }
  return _provider;
}

function getWallet(): Wallet {
  if (!_wallet) {
    if (!DEPLOYER_PRIVATE_KEY) {
      throw new Error('DEPLOYER_PRIVATE_KEY is not set in environment variables');
    }
    _wallet = new Wallet(DEPLOYER_PRIVATE_KEY, getProvider());
  }
  return _wallet;
}

function getContract(): Contract {
  if (!_contract) {
    if (!CONTRACT_ADDRESS) {
      throw new Error('CONTRACT_ADDRESS is not set in environment variables');
    }
    _contract = new Contract(CONTRACT_ADDRESS, PENSION_VAULT_ABI, getWallet());
  }
  return _contract;
}

// Read-only contract (no signer needed)
function getReadContract(): Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is not set in environment variables');
  }
  return new Contract(CONTRACT_ADDRESS, PENSION_VAULT_ABI, getProvider());
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Check if blockchain integration is properly configured
 */
export function isBlockchainConfigured(): boolean {
  return !!(DEPLOYER_PRIVATE_KEY && CONTRACT_ADDRESS && RPC_URL);
}

/**
 * Get deployer wallet address
 */
export function getDeployerAddress(): string {
  return getWallet().address;
}

/**
 * Contribute to the PensionVault on behalf of a user.
 * The deployer wallet calls contribute() and sends MATIC with the transaction.
 * 
 * @param userId - App-level user ID (stored as reference, not on-chain)
 * @param amountInr - Amount in INR (converted to a small MATIC value for testnet)
 * @returns Transaction receipt with hash and block number
 */
export async function contribute(userId: string, amountInr: number): Promise<{
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  amountWei: string;
  amountMatic: string;
  explorerUrl: string;
}> {
  const contract = getContract();

  // Convert INR to a small MATIC amount for testnet demonstration
  // Using a symbolic conversion: ₹1 = 0.0001 MATIC (testnet only)
  const maticAmount = (amountInr * 0.0001).toFixed(8);
  const valueWei = parseEther(maticAmount);

  console.log(`[Blockchain] Contributing ${maticAmount} MATIC (₹${amountInr}) for user ${userId}`);

  // Call the contribute() function with MATIC value
  const tx = await contract.contribute({ value: valueWei });
  console.log(`[Blockchain] Tx submitted: ${tx.hash}`);

  // Wait for confirmation (1 block)
  const receipt = await tx.wait(1);

  console.log(`[Blockchain] Tx confirmed in block ${receipt.blockNumber}, gas used: ${receipt.gasUsed.toString()}`);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    amountWei: valueWei.toString(),
    amountMatic: maticAmount,
    explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
  };
}

/**
 * Get the PensionVault on-chain account for the deployer address.
 */
export async function getOnChainAccount(): Promise<{
  totalContributed: string;
  employerMatch: string;
  totalBalance: string;
  createdAt: number;
  isActive: boolean;
}> {
  const contract = getReadContract();
  const wallet = getWallet();

  const [totalContributed, employerMatch, totalBalance, createdAt, isActive] =
    await contract.getAccount(wallet.address);

  return {
    totalContributed: formatEther(totalContributed),
    employerMatch: formatEther(employerMatch),
    totalBalance: formatEther(totalBalance),
    createdAt: Number(createdAt),
    isActive,
  };
}

/**
 * Get the total contract balance (all funds held in the vault).
 */
export async function getContractBalance(): Promise<{
  balanceWei: string;
  balanceMatic: string;
}> {
  const contract = getReadContract();
  const balance = await contract.getContractBalance();

  return {
    balanceWei: balance.toString(),
    balanceMatic: formatEther(balance),
  };
}

/**
 * Get the deployer wallet's native MATIC balance.
 */
export async function getWalletBalance(): Promise<{
  balanceWei: string;
  balanceMatic: string;
}> {
  const provider = getProvider();
  const wallet = getWallet();
  const balance = await provider.getBalance(wallet.address);

  return {
    balanceWei: balance.toString(),
    balanceMatic: formatEther(balance),
  };
}

/**
 * Get recent ContributionMade events from the contract.
 */
export async function getRecentContributions(count: number = 20): Promise<Array<{
  worker: string;
  amount: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}>> {
  const contract = getReadContract();

  // Query last ~5000 blocks for events
  const currentBlock = await getProvider().getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 5000);

  const filter = contract.filters.ContributionMade();
  const events = await contract.queryFilter(filter, fromBlock, currentBlock);

  return events
    .slice(-count)
    .map((event: any) => ({
      worker: event.args[0],
      amount: formatEther(event.args[1]),
      timestamp: Number(event.args[2]),
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
    }));
}

/**
 * Check if the blockchain connection is healthy.
 */
export async function healthCheck(): Promise<{
  connected: boolean;
  network: string;
  chainId: number;
  blockNumber: number;
  deployerAddress: string;
  deployerBalance: string;
  contractAddress: string;
  contractBalance: string;
}> {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const walletBal = await getWalletBalance();
    const contractBal = await getContractBalance();

    return {
      connected: true,
      network: network.name,
      chainId: Number(network.chainId),
      blockNumber,
      deployerAddress: getDeployerAddress(),
      deployerBalance: walletBal.balanceMatic + ' MATIC',
      contractAddress: CONTRACT_ADDRESS!,
      contractBalance: contractBal.balanceMatic + ' MATIC',
    };
  } catch (error: any) {
    throw new Error(`Blockchain health check failed: ${error.message}`);
  }
}
