const { network } = require("hardhat");
const {
  INITIAL_ANSWER,
  DECIMAL,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../hardhat.config");
const { verifyContract } = require("../Utils/verify");

module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Deploying Aggregator Mock...");
  log(network.name);
  log(developmentChains, deployer);
  if (developmentChains.includes(network.name)) {
    console.log("Local network detected! Deploying mocks...");
    await deploy("MockAggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMAL, INITIAL_ANSWER],
      log: true,
    });
  }
};

module.exports.tags = ["all", "mock-aggregator"];
