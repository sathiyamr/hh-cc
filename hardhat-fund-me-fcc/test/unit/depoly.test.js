const { expect } = require("chai");
const { deployments, getNamedAccounts, network } = require("hardhat");
const { ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Deploy-Fund-Me", function () {
      let fundMe, mockAggregator, deployerAddress;

      beforeEach(async function () {
        await deployments.fixture(["all"]); // This will run the deployment scripts tagged with "all"
        // get the deployer account
        // first address in the accounts array is the deployer
        const { deployer } = await getNamedAccounts();
        deployerAddress = deployer;

        // get the deployed contract instance
        // deployer is the account that deployed the contract
        // Get the deployed FundMe contract instance
        // why passing deployer? Because we want to interact with the contract as the deployer
        fundMe = await ethers.getContract("FundMe", deployer);

        // before this I am getting No Contract deployed with the name MockV3Aggregator
        // const mockAggregator = await ethers.getContract(
        //   "MockV3Aggregator",
        //   deployer
        // );

        //The actual contract being deployed is "MockV3Aggregator" (the contract in your codebase).
        //"MockAggregator" is the name you will use to reference this deployment

        mockAggregator = await ethers.getContract("MockAggregator", deployer);
        // refer this image regarding - mock - hh-cc/ContractName-Vs-Deploymentname-Hardhat.png
      });

      it("Price feed address of Fund me should match", async function () {
        const priceFeedAddress = await fundMe.getPriceFeed();
        const expectedPriceFeedAddress = mockAggregator.target;
        expect(priceFeedAddress).to.equal(expectedPriceFeedAddress);
      });

      it("Should fail due to insufficient funds", async function () {
        await expect(fundMe.fund()).to.be.revertedWith(
          "Does not meet the minimum USD requirement"
        );
      });

      it("Should fund the contract", async function () {
        const sendValue = ethers.parseEther("1"); // 1 ETH in wei
        const transactionResponse = await fundMe.fund({
          value: sendValue,
        });
        await transactionResponse.wait(1); // wait for 1 block confirmation
        const fundedAmount =
          await fundMe.addressToAmountFunded(deployerAddress);
        expect(fundedAmount.toString()).to.equal(sendValue.toString());
      });

      it("Should return deployer address, from funders array", async function () {
        const sendValue = ethers.parseEther("1"); // 1 ETH in wei
        const transactionResponse = await fundMe.fund({
          value: sendValue,
        });
        await transactionResponse.wait(1);
        const funders = await fundMe.funders(0);
        expect(funders).to.equal(deployerAddress);

        const contractBalance = await ethers.provider.getBalance(fundMe.target);
        expect(contractBalance.toString()).to.equal(sendValue.toString());
      });

      it("withDraw Function to be executed ", async function () {
        const sendValue = ethers.parseEther("1"); // 1 ETH in wei
        const transactionResponse = await fundMe.fund({
          value: sendValue,
        });
        const transactionReciept = await transactionResponse.wait(1);
        const { gasUsed, gasPrice } = transactionReciept;
        console.log(
          `Gas used for funding: ${gasUsed.toString()}, Gas price: ${gasPrice.toString()}`
        );

        const contractBalance = await ethers.provider.getBalance(fundMe.target);
        expect(contractBalance.toString()).to.equal(sendValue.toString());

        await fundMe.withDraw();
        const finalBalance = await ethers.provider.getBalance(fundMe.target);
        expect(finalBalance.toString()).to.equal("0");
      });

      it("allow, withdraw function to be executed by only owner", async function () {
        const sendValue = ethers.parseEther("1"); // 1 ETH in wei
        const transactionResponse = await fundMe.fund({
          value: sendValue,
        });
        await transactionResponse.wait(1);

        // Attempt to withdraw from a different account
        const [_, nonOwner] = await ethers.getSigners();
        const fundMeConnectedContract = await fundMe.connect(nonOwner);

        await expect(
          fundMeConnectedContract.withDraw()
        ).to.be.revertedWithCustomError(fundMe, "NotOwner");
      });

      it("Should allow multiple funders to fund the contract", async function () {
        const sendValue = ethers.parseEther("0.0025"); // 1 ETH in wei

        const [_, secondFunder, thirdFunder] = await ethers.getSigners();
        const fundMeConnectedContract = await fundMe.connect(secondFunder);
        const secondTransactionResponse = await fundMeConnectedContract.fund({
          value: sendValue,
        });
        await secondTransactionResponse.wait(1);

        const fundMeConnectedContract_3 = await fundMe.connect(thirdFunder);
        const secondTransactionResponse_3 =
          await fundMeConnectedContract_3.fund({
            value: sendValue,
          });
        await secondTransactionResponse_3.wait(1);

        const contractBalance = await ethers.provider.getBalance(fundMe.target);
        const expectedBalance = sendValue * 2n;
        expect(contractBalance.toString()).to.equal(expectedBalance.toString());

        // get balance of contract after funding
        const startingFundMeBalanceAfterFund = await ethers.provider.getBalance(
          fundMe.target
        );
        // get balance of deployer before withdraw
        const startingDeployerBalance =
          await ethers.provider.getBalance(deployerAddress);

        // Withdraw from the contract
        const withdrawTransactionResponse = await fundMe.withDraw();

        const withdrawTransactionReceipt =
          await withdrawTransactionResponse.wait(1);
        const { gasUsed, gasPrice } = withdrawTransactionReceipt;
        const gasCost = gasUsed * gasPrice;

        const endingDeployerBalance =
          await ethers.provider.getBalance(deployerAddress);
        const endingFundMeBalance = await ethers.provider.getBalance(
          fundMe.target
        );

        expect(endingFundMeBalance).to.equal("0");
        expect(endingDeployerBalance).to.equal(
          startingDeployerBalance + startingFundMeBalanceAfterFund - gasCost
        );
      });
    });
