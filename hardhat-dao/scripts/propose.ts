import { ethers, network } from "hardhat";
import {
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRITPION,
  VOTING_DELAY,
  developmentChains,
  PROPOSAL_FILE,
} from "../helper-hardhat-config";

import * as fs from "fs";

import { moveBlocks } from "../Utils/helper";

const propose = async (
  args: any[],
  functionToCall: string,
  proposalDescription: string
) => {
  const governorContract = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");

  const encodedFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  );

  console.log(`Proposing ${functionToCall} on ${box.target} with ${args}`);
  console.log(`Proposal Description:\n  ${proposalDescription}`);

  /*
  🧠 What is calldata?
Calldata is the low-level raw byte data that represents:

which function should be called,

and what arguments should be passed.

When we interact with a contract, we normally call:

box.store(123)

But when we send a transaction manually (e.g., inside a DAO proposal), we cannot call functions like this directly — we must send encoded bytes that Ethereum understands.


calldata = the byte format representing that instruction.

*/

  const proposalTx = await (governorContract as any).propose(
    [box.target],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const proposalReceipt = await proposalTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  const proposalId = proposalReceipt.logs[0].args.proposalId;
  console.log("Proposal ID:", proposalId);

  let proposals = JSON.parse(fs.readFileSync(PROPOSAL_FILE, "utf8"));
  proposals[network.config.chainId!.toString()].push(proposalId.toString());
  console.log("proposals:", proposals);

  fs.writeFileSync(PROPOSAL_FILE, JSON.stringify(proposals));
};

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRITPION)
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
