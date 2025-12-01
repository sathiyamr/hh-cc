import { Address } from "hardhat-deploy/types";
import { run } from "hardhat";

const verifyContract = async (address: Address, constructorArguments: unknown[]) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
};

export default verifyContract;
