const { run } = require("hardhat");

const verifyContract = async (address, constructorArguments) => {
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

module.exports = {
  verifyContract,
};
