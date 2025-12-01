import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { developmentChains, VOTING_PERIOD, VOTING_DELAY, QUORUM_PERCENTAGE } from "../helper-hardhat-config";
import { network, ethers } from "hardhat";
import verifyContract from "../Utils/verify";

const deployBox: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;


  const args: any = [];
  const boxCont = await deploy("Box", {
    contract: "Box",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: (hre.network.config as any).blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // boxCont.address is the address of the deployed contract

    await verifyContract(boxCont.address, args);
  }

  const timeLockCont = await ethers.getContract("TimeLock");
  const boxContract = await ethers.getContractAt("Box", boxCont.address);
  const transferOwnerTx = await boxContract.transferOwnership(timeLockCont.target);
  await transferOwnerTx.wait(1);

  console.log("You are done!!!! ");




}


export default deployBox;