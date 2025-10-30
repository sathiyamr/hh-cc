const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verifyContract } = require("../Utils/verify");

module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;
  const args = [];

  const nftMarketplace = await deploy("NftMarketplace", {
    contract: "NftMarketplace",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // nftMarketplace.address is the address of the deployed contract

    await verifyContract(nftMarketplace.address, args);
  }
};

module.exports.tags = ["all", "nftmarketplace"];
