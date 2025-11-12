const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verifyContract } = require("../Utils/verify");

module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

 

  const args = [];
  const paypalCont = await deploy("Paypal", {
    contract: "Paypal",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // paypalCont.address is the address of the deployed contract

    await verifyContract(paypalCont.address, args);
  }
};

module.exports.tags = ["all", "paypal"];
