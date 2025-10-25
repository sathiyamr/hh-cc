const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

// hre -> hardhat runtime environment
module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

  // const keyHash =
  //   "0x0000000000000000000000000000000000000000000000000000000000000000";
  // const requestId = 1;
  // const preSeed = 1;
  // const subId = 1;
  // const minimumRequestConfirmations = 3;
  // const callbackGasLimit = 100000;
  // const numWords = 1;
  // const sender = deployer;

  // const args = [
  //   keyHash,
  //   requestId,
  //   preSeed,
  //   subId,
  //   minimumRequestConfirmations,
  //   callbackGasLimit,
  //   numWords,
  //   sender,
  // ];

  const BASE_FEE = await ethers.parseEther("0.25"); // 0.25 is the premium. It costs 0.25 LINK per request
  const GAS_PRICE_LINK = 1e9;
  const WEIPERUNITLINK = 1e15;

  // link per gas. Calculated value based on the gas price of the chain. 0.000000001 LINK per gas
  // payment = BASE_FEE + (50,000 × 0.000000001 LINK)
  //       = BASE_FEE + 0.00005 LINK
  //  1 LINK = 1000000000000000000 juels
  // 	0.000000001 = 1000000000 juels

  if (developmentChains.includes(network.name)) {
    const args = [BASE_FEE, GAS_PRICE_LINK, WEIPERUNITLINK];
    const VRFCoordinatorV2_5Mock = await deploy("VRFCoordinatorV2_5Mock", {
      contract: "VRFCoordinatorV2_5Mock",
      args: args, // constructor arguments
      from: deployer,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1, // wait for 1 block confirmation
    });
    log("----------------------------------------------------");
    log("VRFCoordinatorV2_5Mock deployed at " + VRFCoordinatorV2_5Mock.address);
  }
};

module.exports.tags = ["all", "mock-v2_5-coordinator", "main"];
