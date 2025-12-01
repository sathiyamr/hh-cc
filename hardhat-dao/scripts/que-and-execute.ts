import { ethers, network } from "hardhat";
import {
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRITPION,
  VOTING_DELAY,
  developmentChains,
  PROPOSAL_FILE,
  MIN_DELAY,
} from "../helper-hardhat-config";

import { moveBlocks, moveTime } from "../Utils/helper";

const queAndExecute = async () => {
  const args = [NEW_STORE_VALUE];

  const box = await ethers.getContract("Box");

  const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args);
  const descriptionHash = ethers.keccak256(
    ethers.toUtf8Bytes(PROPOSAL_DESCRITPION)
  );
  const governorContract = await ethers.getContract("GovernorContract");
  console.log("Queueing...");
  const queueTx = await (governorContract as any).queue(
    [box.target],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );

  await queueTx.wait(1);
  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
  }

  const executeTx = await (governorContract as any).execute(
    [box.target],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await executeTx.wait(1);

  const retriveTx = await (box as any).retrieve();
  console.log(`{the New Value ${retriveTx}}`);
};

queAndExecute()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
