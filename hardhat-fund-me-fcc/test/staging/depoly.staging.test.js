const { expect } = require("chai");
const { deployments, getNamedAccounts, network } = require("hardhat");
const { ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Deploy-Fund-Me", function () {
      let fundMe, deployerAddress;

      beforeEach(async function () {
        const { deployer } = await getNamedAccounts();
        deployerAddress = deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Call fund fn and withdraw the amount to deployer address", async function () {
        const sendValue = ethers.parseEther("0.003");
        const transactionResponse = await fundMe.fund({
          value: sendValue,
        });
        await transactionResponse.wait(1);
        const withdrawTransactionResponse = await fundMe.withDraw();
        await withdrawTransactionResponse.wait(1);
        const contractBalance = await ethers.provider.getBalance(fundMe.target);
        expect(contractBalance).to.equal("0");
      });
    });
