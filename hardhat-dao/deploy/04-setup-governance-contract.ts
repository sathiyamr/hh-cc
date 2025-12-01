import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { ADDRESS_ZERO } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deploySetUpGovernanceContract: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

  const governor = await ethers.getContract("GovernorContract", deployer);
  const timeLock = await ethers.getContract("TimeLock", deployer);

  console.log("----------------------------------------------------");
  console.log("Setting up contracts for roles...");
  const proposerRole = await (timeLock as any).PROPOSER_ROLE();
  const executerRole = await (timeLock as any).EXECUTOR_ROLE();
  const cancelRole = await (timeLock as any).CANCELLER_ROLE();

  console.log(proposerRole, executerRole);

  const proposerTx = await (timeLock as any).grantRole(
    proposerRole,
    governor.target
  );
  await proposerTx.wait(1);
  const executorTx = await (timeLock as any).grantRole(
    executerRole,
    ADDRESS_ZERO
  );
  await executorTx.wait(1);
  const cancelTx = await (timeLock as any).grantRole(cancelRole, deployer);
  await cancelTx.wait(1);
};

export default deploySetUpGovernanceContract;
