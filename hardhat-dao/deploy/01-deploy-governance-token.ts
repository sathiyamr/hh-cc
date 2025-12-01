import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { developmentChains } from "../helper-hardhat-config";
import { network, ethers } from "hardhat";
import verifyContract from "../Utils/verify";

const deployGovernancetoken: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

  const args: any = [];
  const governanceToken = await deploy("GovernanceToken", {
    contract: "GovernanceToken",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: (hre.network.config as any).blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // governanceToken.address is the address of the deployed contract

    await verifyContract(governanceToken.address, args);
  }

  await delegate(governanceToken.address, deployer);

  console.log("delegated");
};

const delegate = async (
  governanceTokenAddress: string,
  delegatedAccount: string
) => {
  const governanceTokenContract = await ethers.getContractAt(
    "GovernanceToken",
    governanceTokenAddress
  );

  const tx = await governanceTokenContract.delegate(delegatedAccount);
  await tx.wait(1);

  console.log(
    `CheckPoints ${await governanceTokenContract.numCheckpoints(
      delegatedAccount
    )}`
  );
};

export default deployGovernancetoken;
