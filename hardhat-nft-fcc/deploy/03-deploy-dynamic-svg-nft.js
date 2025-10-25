const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verifyContract } = require("../Utils/verify");
const fs = require("fs");

module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

  let priceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const priceFeed = await deployments.get("MockAggregator");
    priceFeedAddress = priceFeed.address;
  } else {
    priceFeedAddress = networkConfig[chainId].priceFeedAddress;
  }
  // UTF-8
  // Encoding standard that converts characters ↔ bytes
  const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", "utf8");
  const highSvg = await fs.readFileSync(
    "./images/dynamicNft/happy.svg",
    "utf8"
  );

  const args = [priceFeedAddress, lowSvg, highSvg];

  console.log("args", args);

  const dynamicSVGNft = await deploy("DynamicSvgNft", {
    contract: "DynamicSvgNft",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // dynamicSVGNft.address is the address of the deployed contract

    await verifyContract(dynamicSVGNft.address, args);
  }
};

module.exports.tags = ["all", "dynamicSvgNft", "main"];
