import { ethers, run } from "hardhat";
import {
    ERC20TokenFee,
    StakingPool,
    ERC20TokenFee__factory,
    StakingPool__factory
} from "../typechain-types";

async function main() {

    // ERC20TokenFee.sol Deploy
    const ERC20TokenFeeFactory = (await ethers.getContractFactory(
        "ERC20TokenFee"
    )) as ERC20TokenFee__factory;

    const ERC20Token = (await ERC20TokenFeeFactory.deploy()) as ERC20TokenFee;
    await ERC20Token.deployed(); // this waits for tx to be mined

    try {
        await run("verify:verify", {
            address: ERC20Token.address,
            contract: "contracts/token/ERC20TokenFee.sol:ERC20TokenFee",
            constructorArguments: [],
        });
    } catch (e: any) {
        console.error(`error in verifying: ${e.message}`);
    }

    // StakingTokens.sol Deploy
    const stakingPoolFactory = (await ethers.getContractFactory(
        "StakingPool"
    )) as StakingPool__factory;

    const stakingPool = (await stakingPoolFactory.deploy(
        ERC20Token.address
    )) as StakingPool;

    await stakingPool.deployed(); // this waits for tx to be mined

    try {
        await run("verify:verify", {
            address: stakingPool.address,
            contract: "contracts/StakingPool.sol:StakingPool",
            constructorArguments: [ERC20Token.address],
        });
    } catch (e:any) {
        console.error(`error in verifying: ${e.message}`);
    }

    console.log("ERC20 Tokens deployed to:", ERC20Token.address);
    console.log("Staking Pool contract deployed to:", stakingPool.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });