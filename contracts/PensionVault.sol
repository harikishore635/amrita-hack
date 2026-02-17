// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PensionVault
 * @dev Manages pension contributions, employer matching, and withdrawals
 * @notice PensionChain - Blockchain Pension for India's Informal Workers
 */
contract PensionVault {
    address public owner;
    
    struct PensionAccount {
        uint256 totalContributed;
        uint256 employerMatch;
        uint256 totalBalance;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(address => PensionAccount) public accounts;
    mapping(address => bool) public registeredEmployers;
    
    uint256 public constant EMERGENCY_WITHDRAWAL_PENALTY = 10; // 10%
    uint256 public constant MAX_EMERGENCY_PERCENTAGE = 50; // 50% of balance
    uint256 public constant RETIREMENT_AGE_SECONDS = 25 * 365 days; // 25 years from creation
    
    event ContributionMade(address indexed worker, uint256 amount, uint256 timestamp);
    event EmployerMatchAdded(address indexed worker, address indexed employer, uint256 amount);
    event EmergencyWithdrawal(address indexed worker, uint256 amount, uint256 penalty);
    event RetirementWithdrawal(address indexed worker, uint256 amount);
    event EmployerRegistered(address indexed employer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyRegisteredEmployer() {
        require(registeredEmployers[msg.sender], "Not a registered employer");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Worker contributes to their pension
     */
    function contribute() external payable {
        require(msg.value > 0, "Contribution must be > 0");
        
        PensionAccount storage account = accounts[msg.sender];
        
        if (!account.isActive) {
            account.createdAt = block.timestamp;
            account.isActive = true;
        }
        
        account.totalContributed += msg.value;
        account.totalBalance += msg.value;
        
        emit ContributionMade(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Employer adds matching contribution for a worker
     */
    function addEmployerMatch(address worker) external payable onlyRegisteredEmployer {
        require(msg.value > 0, "Match must be > 0");
        require(accounts[worker].isActive, "Worker account not active");
        
        accounts[worker].employerMatch += msg.value;
        accounts[worker].totalBalance += msg.value;
        
        emit EmployerMatchAdded(worker, msg.sender, msg.value);
    }
    
    /**
     * @dev Emergency withdrawal (with penalty)
     */
    function emergencyWithdraw(uint256 amount) external {
        PensionAccount storage account = accounts[msg.sender];
        require(account.isActive, "No active account");
        
        uint256 maxWithdraw = (account.totalBalance * MAX_EMERGENCY_PERCENTAGE) / 100;
        require(amount <= maxWithdraw, "Exceeds emergency limit (50%)");
        
        uint256 penalty = (amount * EMERGENCY_WITHDRAWAL_PENALTY) / 100;
        uint256 netAmount = amount - penalty;
        
        account.totalBalance -= amount;
        
        (bool sent, ) = msg.sender.call{value: netAmount}("");
        require(sent, "Transfer failed");
        
        emit EmergencyWithdrawal(msg.sender, netAmount, penalty);
    }
    
    /**
     * @dev Full retirement withdrawal (after retirement period)
     */
    function retirementWithdraw() external {
        PensionAccount storage account = accounts[msg.sender];
        require(account.isActive, "No active account");
        require(
            block.timestamp >= account.createdAt + RETIREMENT_AGE_SECONDS,
            "Not yet eligible for retirement"
        );
        
        uint256 amount = account.totalBalance;
        account.totalBalance = 0;
        account.isActive = false;
        
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");
        
        emit RetirementWithdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Register an employer
     */
    function registerEmployer(address employer) external onlyOwner {
        registeredEmployers[employer] = true;
        emit EmployerRegistered(employer);
    }
    
    /**
     * @dev Get pension account details
     */
    function getAccount(address worker) external view returns (
        uint256 totalContributed,
        uint256 employerMatch,
        uint256 totalBalance,
        uint256 createdAt,
        bool isActive
    ) {
        PensionAccount memory account = accounts[worker];
        return (
            account.totalContributed,
            account.employerMatch,
            account.totalBalance,
            account.createdAt,
            account.isActive
        );
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
