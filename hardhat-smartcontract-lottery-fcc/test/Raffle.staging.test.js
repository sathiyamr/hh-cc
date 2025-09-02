const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { expect } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, deployer;
      beforeEach(async function () {
        deployer = (await ethers.getSigners())[0];
        console.log(deployer);
        raffle = await ethers.getContract("Raffle", deployer);
      });

      it("Picks a winner, resets the lottery and send money", async function () {
        const balanceBeforWin_and_enterRaffle =
          await ethers.provider.getBalance(deployer.address);

        console.log(balanceBeforWin_and_enterRaffle);

        await new Promise(async (resolve, reject) => {
          raffle.once("WinnerPicked", async (winner) => {
            console.log("WinnerPicked event fired:", winner);

            try {
              const raffleState = await raffle.getRaffleState();
              expect(raffleState).to.equal(0);

              resolve();
            } catch (err) {
              reject(err);
            }
          });
          console.log(
            "Entrance fee:",
            (await raffle.getEntranceFee()).toString()
          );
          console.log("Raffle state:", await raffle.getRaffleState());
          try {
            await raffle.enterRaffle({ value: ethers.parseEther("0.01") });
          } catch (e) {
            console.log("Reverted with:", e);
          }

          const balanceBeforWin_and_enterRaffle_after_entry =
            await ethers.provider.getBalance(raffle.target);

          console.log(balanceBeforWin_and_enterRaffle_after_entry);

          const balanceBeforWin_and_enterRaffle_after_deployer =
            await ethers.provider.getBalance(deployer.address);

          console.log(balanceBeforWin_and_enterRaffle_after_deployer);

          // await expect(
          //   raffle.enterRaffle({ value: 0 })
          // ).to.be.revertedWithCustomError(
          //   raffle,
          //   "Raffle__NotEnoughETHEntered"
          // );
        });
      });
    });
