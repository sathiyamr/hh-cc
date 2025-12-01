import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { developmentChains, MIN_DELAY } from "../helper-hardhat-config";
import { network, ethers } from "hardhat";
import verifyContract from "../Utils/verify";

const deployTimeLock: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

  const args: any = [MIN_DELAY, [], [], deployer];
  const timeLock = await deploy("TimeLock", {
    contract: "TimeLock",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: (hre.network.config as any).blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // timeLock.address is the address of the deployed contract

    await verifyContract(timeLock.address, args);
  }
};

export default deployTimeLock;
