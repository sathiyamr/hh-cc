const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, vrfCoordinatorV2_5Mock, deployer;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2_5Mock = await ethers.getContract(
          "VRFCoordinatorV2_5Mock",
          deployer
        );
        // refer this image regarding - mock - hh-cc/ContractName-Vs-Deploymentname-Hardhat.png
      });

      describe("Constructor", function () {
        it("Initialized the raffle correctly", async function () {
          const raffleStatus = await raffle.getRaffleState();
          expect(raffleStatus.toString()).to.equal("0");
          const interval = await raffle.getInterval();
          expect(interval.toString()).to.equal(
            networkConfig[network.config.chainId].interval
          );
          const entranceFee = await raffle.getEntranceFee();
          expect(entranceFee.toString()).to.equal(
            networkConfig[network.config.chainId].entranceFee
          );
        });
      });

      describe("Enter Raffle", function () {
        it("Reverts when you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__NotEnoughETHEntered"
          );
        });

        it("Records player when they enter", async function () {
          await raffle.enterRaffle({ value: ethers.parseEther("0.01") });
          const playerFromContract = await raffle.getPlayer(0);
          expect(playerFromContract).to.equal(deployer);
        });

        it("Emits event on enter", async function () {
          await expect(
            raffle.enterRaffle({ value: ethers.parseEther("0.01") })
          ).to.emit(raffle, "RaffleEnter");
        });

        it("Doesn't allow entrance when raffle is calculating", async function () {
          await raffle.enterRaffle({ value: ethers.parseEther("0.01") });
          const interval = await raffle.getInterval();
          ethers.provider.send("evm_increaseTime", [Number(interval) + 1]);
          ethers.provider.send("evm_mine", []); // ? why have to mine here?  To make sure the next block is mined after the time increase
          await raffle.performUpkeep("0x");
          // do we need to use await here?  Yes, because performUpkeep is an async function
          //  how async function ? It is because it interacts with the blockchain and we need to wait for the transaction to be mined
          await expect(
            raffle.enterRaffle({ value: ethers.parseEther("0.01") })
          ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen");
        });
      });

      describe("checkUpkeep", function () {
        it("returns false if people haven't send any ETH ", async function () {
          const interval = await raffle.getInterval();
          ethers.provider.send("evm_increaseTime", [Number(interval) + 1]);
          ethers.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          expect(!upkeepNeeded);
        });

        it("returns false, if the raffle status is not open", async function () {
          await raffle.enterRaffle({ value: ethers.parseEther("0.01") });
          const interval = await raffle.getInterval();
          ethers.provider.send("evm_increaseTime", [Number(interval) + 1]);
          ethers.provider.send("evm_mine", []); // ? why have to mine here?  To make sure the next block is mined after the time increase
          await raffle.performUpkeep("0x");
          const status = await raffle.getRaffleState();
          expect(status.toString()).to.equal("1");
          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          expect(!upkeepNeeded);
        });

        it("returns false, if the interval is less than 30", async function () {
          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          expect(!upkeepNeeded);
        });

        it("returns true, if all the conditons are matched", async function () {
          await raffle.enterRaffle({ value: ethers.parseEther("0.01") });
          const interval = await raffle.getInterval();
          ethers.provider.send("evm_increaseTime", [Number(interval) + 1]);
          ethers.provider.send("evm_mine", []); // ? why have to mine here?  To make sure the next block is mined after the time increase
          const status = await raffle.getRaffleState();
          expect(status.toString()).to.equal("0");
          const { upkeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upkeepNeeded);
        });
      });

      describe("performUpkeep", function () {
        it("return true, whether performupkeep is running or not ", async function () {
          await raffle.enterRaffle({ value: ethers.parseEther("0.01") });
          const interval = await raffle.getInterval();
          ethers.provider.send("evm_increaseTime", [Number(interval) + 1]);
          ethers.provider.send("evm_mine", []);

          const tx = await raffle.performUpkeep("0x");
          expect(tx);
        });

        it("return error Raffle__UpKeepNotNeeded, when condition are not met", async function () {
          await expect(
            raffle.performUpkeep("0x")
          ).to.be.revertedWithCustomError(raffle, "Raffle__UpKeepNotNeeded");
        });

        it("Updated the raffle state, emits and event and calls the vrf cordinator", async function () {
          await raffle.enterRaffle({ value: ethers.parseEther("0.1") });
          const interval = await raffle.getInterval();
          ethers.provider.send("evm_increaseTime", [Number(interval) + 1]);
          ethers.provider.send("evm_mine", []);

          const tx = await raffle.performUpkeep("0x");
          const receipt = await tx.wait(1);
          const event = receipt.logs
            .map((log) => raffle.interface.parseLog(log))
            .find((e) => e?.name === "RequestedRaffleWinner");

          const requestId = event?.args[0];
          expect(Number(requestId)).to.equal(1);
        });
      });

      describe("fulfillRandomWords", function () {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: ethers.parseEther("0.01") });
          const interval = await raffle.getInterval();
          ethers.provider.send("evm_increaseTime", [Number(interval) + 1]);
          ethers.provider.send("evm_mine", []);
        });

        it("If invalid subscription id fails the fn call  ", async function () {
          await expect(
            vrfCoordinatorV2_5Mock.fulfillRandomWords(0, raffle.target)
          ).to.be.revertedWithCustomError(
            vrfCoordinatorV2_5Mock,
            "InvalidRequest"
          );

          await expect(
            vrfCoordinatorV2_5Mock.fulfillRandomWords(1, raffle.target)
          ).to.be.revertedWithCustomError(
            vrfCoordinatorV2_5Mock,
            "InvalidRequest"
          );
        });

        it("Picks a winner, resets the lottery and send money", async function () {
          const startingIndex = 1;
          const additionalAccounts = 3;
          // Get all available accounts/signers
          const accounts = await ethers.getSigners();

          for (i = startingIndex; i < 1 + additionalAccounts; i++) {
            // Now connect accounts[i] to the contract
            // console.log(i, accounts[i].address);
            const raffleFromAddr1 = raffle.connect(accounts[i]);

            // Call enterRaffle as addr1
            await raffleFromAddr1.enterRaffle({
              value: ethers.parseEther("0.01"),
            });
          }

          const balanceBeforWin = await ethers.provider.getBalance(
            accounts[1].address
          );

          new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async (winner) => {
              // console.log("WinnerPicked event fired:", winner);

              try {
                // Example assertion: winner is one of the accounts who entered
                expect([
                  accounts[1].address,
                  accounts[2].address,
                  accounts[3].address,
                ]).to.include(winner);

                // Example assertion: raffle state reset
                const raffleState = await raffle.getRaffleState();
                expect(raffleState).to.equal(0);

                const balanceAfterWin = await ethers.provider.getBalance(
                  accounts[1].address
                );

                console.log(
                  "balanceAfterWin",
                  balanceAfterWin,
                  "--",
                  ethers.parseEther("0.01") * BigInt(additionalAccounts + 1) +
                    balanceBeforWin
                );

                expect(balanceAfterWin).to.be.equal(
                  ethers.parseEther("0.01") * BigInt(additionalAccounts + 1) +
                    balanceBeforWin
                );

                resolve();
              } catch (err) {
                reject(err);
              }
            });

            const tx = await raffle.performUpkeep("0x");
            const txReceipt = await tx.wait(1);
            const event = txReceipt.logs
              .map((log) => raffle.interface.parseLog(log))
              .find((e) => e?.name === "RequestedRaffleWinner");

            const requestId = event?.args[0];

            await vrfCoordinatorV2_5Mock.fulfillRandomWords(
              requestId,
              raffle.target
            );
          });
        });
      });
    });
