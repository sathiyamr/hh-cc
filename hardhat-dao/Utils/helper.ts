import { network } from "hardhat";

export const moveBlocks = async (amount: number) => {
  console.log("⛏️  Mining blocks...");
  for (let i = 0; i < amount; i++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
  console.log(`⛏️  Mined ${amount} blocks`);
};

export const moveTime = async (amount: number) => {
  console.log(`⏱️ Moving time by ${amount} seconds...`);
  await network.provider.send("evm_increaseTime", [amount]);
  await network.provider.send("evm_mine"); // Mine a block after increasing time
};
