// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StakingPool is ReentrancyGuard, Ownable {

    using Address for address;

    // Address of the token smart contracts
    address public tokenAddress;

    // Address of the users who are currently staking
    address [] public stakers;

    // MAPPINGS

    // Stores staking balance of ERC20 token of an account address
    mapping(address => uint256) public stakingBalance;

    // Stores true if the account has staked ERC20 tokens prevously else stores false
    mapping(address => bool) public userHasStaked;

    // Stores true if the account is currently staking ERC20 tokens at present else stores false
    mapping(address => bool) public userIsStaking;

    // CONSTRUCTOR

    constructor(address _tokenAddress) {
        // Require statement to check if the token address is a valid address
        require(
            _tokenAddress.isContract(),
            "Reverting: Invalid token address"
        );

        // Assign the address of token smart contract
        tokenAddress = _tokenAddress;
    }

    // FUNCTION IMPLEMENTATION

    // Function logic for staking ERC20 Token
    function stakeToken(
        uint256 _stakingAmount
    ) external payable nonReentrant {
        // Require statement to check if the staking amount is a valid amount
        require(
            _stakingAmount > 0,
            "cannot stake 0 ERC20 token"
        );

        // Update the staking balance of the user
        stakingBalance[msg.sender] += _stakingAmount;

        // Checks if the user account has previously staked
        // If the user has not ever staked then push the user account address to the stakers array
        if(
            !userHasStaked[msg.sender]
        )stakers.push(msg.sender);

        userIsStaking[msg.sender] = true; // Set true for user is staking

        address ERC20TokenFee = address(ERC20(tokenAddress));

        (bool success,) = ERC20TokenFee.call{value: 123}(abi.encodeWithSignature(
            "transferFromWithFee(address,address,uint256)",
            msg.sender,
            address(this),
            _stakingAmount
        ));

        require(
            success,
            "transfer call failed"
        );
    }

    function unstakeToken() external payable nonReentrant {
        // Stores the token amount of user account to balance
        uint256 balance = stakingBalance[msg.sender];

        // Token for unstaking cannot be 0
        require(
            balance > 0,
            "there is no token to unstake"
        );

        // Set the staking balance of the user to 0
        stakingBalance[msg.sender] = 0;
        // Set false for user is staking
        userIsStaking[msg.sender] = false;

        address ERC20TokenFee = address(ERC20(tokenAddress));

        (bool success,) = ERC20TokenFee.call{value: 123}(abi.encodeWithSignature(
            "transferWithFee(address,uint256)",
            msg.sender,
            balance
        ));

        require(
            success,
            "transfer call failed"
        );
    }
}