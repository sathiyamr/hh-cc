import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { developmentChains, VOTING_PERIOD, VOTING_DELAY, QUORUM_PERCENTAGE } from "../helper-hardhat-config";
import { network, ethers } from "hardhat";
import verifyContract from "../Utils/verify";

const deployGovernorContract: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

  const governanceToken = await get("GovernanceToken");
  const timeLock = await get("TimeLock");

  const args: any = [governanceToken.address, timeLock.address, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE];
  const governorContract = await deploy("GovernorContract", {
    contract: "GovernorContract",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: (hre.network.config as any).blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // governorContract.address is the address of the deployed contract

    await verifyContract(governorContract.address, args);
  }


}


export default deployGovernorContract;