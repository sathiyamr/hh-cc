const { ethers, network } = require("hardhat");

async function mockKeepers() {
  const raffle = await ethers.getContract("Raffle");
  //   const checkData = ethers.keccak256(ethers.toUtf8Bytes(""));

  const [upkeepNeeded, performData] = await raffle.checkUpkeep.staticCall("0x");
  //   const [isOpen, timePassed, hasPlayers, hasBalance] =
  //     ethers.AbiCoder.defaultAbiCoder().decode(
  //       ["bool", "bool", "bool", "bool"],
  //       performData
  //     );
  //   console.log("--", isOpen, timePassed, hasPlayers, hasBalance);

  let requestId = null;
  if (upkeepNeeded) {
    const tx = await raffle.performUpkeep("0x");
    const txReceipt = await tx.wait(1);
    for (const log of txReceipt.logs) {
      try {
        const parsed = raffle.interface.parseLog(log);
        if (parsed.name === "RequestedRaffleWinner") {
          requestId = parsed.args.requestId;
          console.log(`Performed upkeep with RequestId: ${requestId}`);
        }
      } catch (e) {
        // skip logs that don't belong to this contract
      }
    }
    console.log("requestId", requestId);
    if (
      (network.name === "hardhat" || network.name === "localhost") &&
      requestId
    ) {
      await mockVrf(requestId, raffle);
    }
  } else {
    console.log("No upkeep needed!");
  }
}

async function mockVrf(requestId, raffle) {
  console.log("We on a local network? Ok let's pretend...");
  const vrfCoordinatorV2_5Mock = await ethers.getContract(
    "VRFCoordinatorV2_5Mock"
  );
  await vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, raffle.target);
  console.log("Responded!");
  const recentWinner = await raffle.getRecentWinner();
  console.log(`The winner is: ${recentWinner}`);
}

mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
