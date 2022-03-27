import { ethers,waffle } from "hardhat";
import { use, expect } from "chai";
import { StakingPool, ERC20TokenFee } from "../typechain-types";
import { setupUsers } from "./utils/setupUsers";
import { BigNumber } from "ethers";
use(waffle.solidity);

type User = { address: string } & { stakingPool: StakingPool, token: ERC20TokenFee };

describe("StakingPool.sol", async() => {
    let users: User[],
        owner: User,
        user1: User,
        stakingPool: StakingPool,
        token: ERC20TokenFee
    
    beforeEach(async() => {
        const signers = await ethers.getSigners();

        // Deploy ERC20TokenFee.sol smart contract
        const ERC20TokenFeeFactory = await ethers.getContractFactory("ERC20TokenFee");
        token = (await (await ERC20TokenFeeFactory.deploy()).deployed()) as ERC20TokenFee;
    
        // Deploy StakingTokens.sol smart contract
        const stakingPoolFactory = await ethers.getContractFactory("StakingPool");
        stakingPool = (await (
            await stakingPoolFactory.deploy(token.address)
        ).deployed()) as StakingPool;
    
        // Setup users
        const addresses = await Promise.all(signers.map(async (signer) => signer.getAddress()));
        users = await setupUsers(addresses, { stakingPool, token });
        owner = users[0];
        user1 = users[1];
    });

    it("The owner should have some tokens to test", async() => {
        // Check if the owner has 1 billion ERC20 tokens
        const balanceOfOwner = await token.balanceOf(owner.address);
        const balance = BigNumber.from(ethers.utils.parseEther("1000000000"));
        expect(balanceOfOwner).to.be.eq(balance);
        
    })

    it("The user should have some tokens to test", async() => {
        // Transfer some tokens to the user address
        const balance = BigNumber.from(ethers.utils.parseEther("1000"));
        await owner.token.transferWithFee(user1.address, balance, {value: 123});

        // Check if the user has 100 ERC20 tokens
        const balanceOfUser = await token.balanceOf(user1.address);
        expect(balanceOfUser).to.be.eq(balance);
    })

    it("User can stake: ERC20 tokens & token transfer charged extra fee", async() => {
        // Transfer some tokens to the user address
        const balance = BigNumber.from(ethers.utils.parseEther("1000"));
        await owner.token.transferWithFee(user1.address, balance, {value: 123});
        
        // Balance of user1 before staking
        const balanceOfUserBeforeStake = await token.balanceOf(user1.address);

        // Staking amount for user1
        const stakingAmount = BigNumber.from(ethers.utils.parseEther("1000"));
 
        // Approve for user1 to stake all of his ERC20 token
        await user1.token.approve(stakingPool.address, stakingAmount);
 
        // Stake all avaliable ERC20 token for the user1
        await user1.stakingPool.stakeToken(stakingAmount, {value:123});
 
        // Balance of user1 after staking
        const balanceOfUserAfterStake = await token.balanceOf(user1.address);
 
        // Check that the amount is equal to 0 after staking
        expect(balanceOfUserAfterStake).to.be.eq(balanceOfUserBeforeStake.sub(stakingAmount))

        // Balance of token contract (fee)
        const contractBalance = await token.contractBalance();
        // Check if the fee is equal
        expect(contractBalance).to.be.eq(BigNumber.from(123*2));
    })

    it("User can unstake: ERC20 tokens & token transfer charged extra fee", async() => {
        // Transfer some tokens to the user address
        const balance = BigNumber.from(ethers.utils.parseEther("1000"));
        await owner.token.transferWithFee(user1.address, balance, {value: 123});
        
        // Balance of user1 before staking
        const balanceOfUserBeforeStake = await token.balanceOf(user1.address);

        // Staking amount for user1
        const stakingAmount = BigNumber.from(ethers.utils.parseEther("1000"));
 
        // Approve for user1 to stake all of his ERC20 token
        await user1.token.approve(stakingPool.address, stakingAmount);
 
        // Stake all avaliable ERC20 token for the user1
        await user1.stakingPool.stakeToken(stakingAmount, {value:123});
 
        // Balance of user1 after staking
        const balanceOfUserAfterStake = await token.balanceOf(user1.address);
 
        // Check that the amount is equal to 0 after staking
        expect(balanceOfUserAfterStake).to.be.eq(balanceOfUserBeforeStake.sub(stakingAmount))

        // Unstake all the staked ERC20 token for the user1
        await user1.stakingPool.unstakeToken({value: 123});

        // Balance of user after unstaking
        const balanceOfUserAfterUnstake = await token.balanceOf(user1.address);

        // Check that the balance of user after unstaking is equal to balance of user before staking
        expect(balanceOfUserAfterUnstake).to.be.eq(balanceOfUserBeforeStake);

        // Balance of token contract (fee)
        const contractBalance = await token.contractBalance();
        // Check if fee is equal
        expect(contractBalance).to.be.eq(BigNumber.from(123*3));
    })
})