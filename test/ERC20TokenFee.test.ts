import { ethers,waffle } from "hardhat";
import { use, expect } from "chai";
import { ERC20TokenFee } from "../typechain-types";
import { setupUsers } from "./utils/setupUsers";
use(waffle.solidity);

type User = { address: string } & { token: ERC20TokenFee };

describe("MockTokenERC20.sol", async () => {
    let users: User[],
        owner: User,
        user1: User,
        token: ERC20TokenFee

    beforeEach(async () => {
        const signers = await ethers.getSigners();

        // Deploy ERC20TokenFee.sol smart contract
        const tokenFactory = await ethers.getContractFactory("ERC20TokenFee");
        token = (await (await tokenFactory.deploy()).deployed()) as ERC20TokenFee;

        // Setup users
        const addresses = await Promise.all(signers.map(async (signer) => signer.getAddress()));
        users = await setupUsers(addresses, { token });
        owner = users[0];
        user1 = users[1];
    });

    it("The contract should have an address", async() => {
        expect(token.address).to.not.equal("0x00");
    })

    it("Name of the token should be Mock Token", async() => {
        const name = await token.name();
        expect(name).to.be.eq("Mock Token");
    })

    it("Symbol of the token should be mToken", async() => {
        const symbol = await token.symbol();
        expect(symbol).to.be.eq("mToken");
    })

    it("Total Supply of the token should be 1 billion ethers", async() => {
        const balance = ethers.utils.parseEther("1000000000");
        const balanceInContract = await token.totalSupply();
        expect(balanceInContract).to.be.eq(balance);
    })

    it("The owner of the smart contract should have all supply of token", async() => {
        const balanceOfOwner = await token.balanceOf(owner.address);
        const totalSupply = await token.totalSupply();
        expect(balanceOfOwner).to.be.eq(totalSupply);
    })
})