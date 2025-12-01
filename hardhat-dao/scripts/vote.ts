import { ethers, network } from "hardhat";
import {
  developmentChains,
  PROPOSAL_FILE,
  VOTING_PERIOD,
} from "../helper-hardhat-config";

import * as fs from "fs";

import { moveBlocks } from "../Utils/helper";
const index = 0;
const vote = async (proposalIndex: number) => {
  let proposals = JSON.parse(fs.readFileSync(PROPOSAL_FILE, "utf8"));
  const proposalId = proposals[network.config.chainId!.toString()][proposalIndex];

  const governorContract = await ethers.getContract("GovernorContract");
  // 0 = Against, 1 => For, 2 => Abstain;

  const voteWay = 1;

  const voteTx = await (governorContract as any).castVoteWithReason(
    proposalId,
    voteWay,
    "Testing Purpose of Reason"
  );
  voteTx.wait(1);
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }

  console.log("Voted,  Ready to go !! ");

  console.log(` state: ${ await (governorContract as any).state(proposalId)}`)

  // IGovernor - Pending | Active | Canceled | Defeated | Succeeded | Queued | Expired | Executed
  // IGovernor - 0       | 1      | 2        | 3        | 4         | 5      | 6       | 7


};

vote(index)
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
