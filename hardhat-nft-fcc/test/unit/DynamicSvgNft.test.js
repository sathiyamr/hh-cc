const { expect } = require("chai");
const { deployments, getNamedAccounts, network } = require("hardhat");
const { ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Dynmic-SVG-Nft", function () {
      let dynamicSvgNft, mockAggregator, deployerAddress;

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        const { deployer } = await getNamedAccounts();
        deployerAddress = deployer;
        dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
        mockAggregator = await ethers.getContract("MockAggregator", deployer);
        // refer this image regarding - mock - hh-cc/ContractName-Vs-Deploymentname-Hardhat.png
      });

      describe("Constructor", function () {
        it("Initialized the Dynamic SVG NFT correctly", async function () {
          const tokenCount = await dynamicSvgNft.getTokenCount();
          expect(tokenCount).to.equal(0);
        });
        it("Call Mint NFT and get the Counter", async function () {
          const highValue = ethers.parseEther("0.00000001");
          await dynamicSvgNft.mintNft(highValue);
          const tokenCount = await dynamicSvgNft.getTokenCount();
          expect(tokenCount).to.equal(1);
        });
      });
    });
