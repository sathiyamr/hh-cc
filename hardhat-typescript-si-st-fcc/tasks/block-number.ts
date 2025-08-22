import { task } from "hardhat/config";

export default task("block-number", "Prints lastest block number").setAction(
  async (_, hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
  }
);
