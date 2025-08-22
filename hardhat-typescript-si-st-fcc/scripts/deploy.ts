import { ethers, run, network } from "hardhat";

async function main() {
  console.log("Deploying contracts...");
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage:any = await SimpleStorage.deploy();
  await simpleStorage.deploymentTransaction()?.wait(6);
  console.log("SimpleStorage deployed to:", simpleStorage.target);
  console.log(network.config);
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await verifyContract(simpleStorage.target, []);
  }
  let value = await simpleStorage.retrieve();
  console.log("Initial value:", value.toString());
  const txResponse = await simpleStorage.store(42);
  await txResponse.wait(); // Wait for the transaction to be mined
  value = await simpleStorage.retrieve();
  console.log("Updated value:", value.toString());
}

async function verifyContract(address: any, constructorArguments: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
