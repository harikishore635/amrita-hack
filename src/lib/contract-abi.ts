/**
 * PensionVault ABI - Only the functions we call from the app.
 * Generated from contracts/PensionVault.sol
 */
export const PENSION_VAULT_ABI = [
  // Write functions
  "function contribute() external payable",
  "function addEmployerMatch(address worker) external payable",
  "function emergencyWithdraw(uint256 amount) external",
  "function retirementWithdraw() external",
  "function registerEmployer(address employer) external",

  // Read functions
  "function owner() external view returns (address)",
  "function getAccount(address worker) external view returns (uint256 totalContributed, uint256 employerMatch, uint256 totalBalance, uint256 createdAt, bool isActive)",
  "function getContractBalance() external view returns (uint256)",
  "function registeredEmployers(address) external view returns (bool)",
  "function accounts(address) external view returns (uint256 totalContributed, uint256 employerMatch, uint256 totalBalance, uint256 createdAt, bool isActive)",

  // Events
  "event ContributionMade(address indexed worker, uint256 amount, uint256 timestamp)",
  "event EmployerMatchAdded(address indexed worker, address indexed employer, uint256 amount)",
  "event EmergencyWithdrawal(address indexed worker, uint256 amount, uint256 penalty)",
  "event RetirementWithdrawal(address indexed worker, uint256 amount)",
  "event EmployerRegistered(address indexed employer)",
] as const;
