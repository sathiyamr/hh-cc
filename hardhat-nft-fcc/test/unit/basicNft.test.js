const { expect } = require("chai");
const { deployments, getNamedAccounts, network } = require("hardhat");
const { ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic-Nft-test", function () {
      let deployerAddress, basicNft;
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        const { deployer } = await getNamedAccounts();
        deployerAddress = deployer;
        basicNft = await ethers.getContract("BasicNft", deployer);
      });

      describe("Constructor Function", function () {
        it("validate token cnt before mint", async function () {
          const tokenCnt = await basicNft.getTokenCounter();
          expect(tokenCnt).to.equal(0);
        });
      });

      describe("Mint Function", function () {
        beforeEach(async function () {
          const tx = await basicNft.mintNft();
          tx.wait(1);
        });
        it("validate token cnt before mint", async function () {
          const tokenCnt = await basicNft.getTokenCounter();
          expect(tokenCnt).to.equal(1);
        });
      });
    });
