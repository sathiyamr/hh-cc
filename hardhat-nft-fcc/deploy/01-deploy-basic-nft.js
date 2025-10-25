const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verifyContract } = require("../Utils/verify");

module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;
  const args = [];

  const basicNft = await deploy("BasicNft", {
    contract: "BasicNft",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // basicNft.address is the address of the deployed contract

    await verifyContract(basicNft.address, args);
  }
};

module.exports.tags = ["all", "basicnft", "main"];
