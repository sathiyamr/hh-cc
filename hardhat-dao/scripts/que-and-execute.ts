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

  /* 

  Your Doubt

In queue-and-execute.ts, why do we need to pass all the same parameters again?
Shouldn't we only pass proposalId or something like that?

Reason

The Governor contract does not store the actual data of the proposal in one place.
Instead, proposals in OpenZeppelin are identified using a proposalId hash:

proposalId = keccak256(abi.encode(targets, values, calldatas, descriptionHash))

So during queue and execute steps, the contract needs the exact same parameters to:

Recompute the proposal hash

Match it with the stored proposal state

That’s why queue() and execute() require:

[targets],  // box.target
[values],   // normally 0
[calldatas], // encodedFunctionCall
descriptionHash


Even though you have the proposalId, you cannot pass only proposalId because the actual mechanism requires recomputing it from the same inputs.


*/

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
