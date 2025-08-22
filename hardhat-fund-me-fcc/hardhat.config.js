const { sign } = require("crypto");

require("hardhat-deploy");
require("hardhat-deploy-ethers"); // <-- add this
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.30",
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0, // first account as deployer
    },
    signer: {
      default: 1, // second account as signer
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      blockConfirmations: 6, // wait for 1 block confirmation
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: false,
    // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};

// We can mention multiple version of solidity compiler
// module.exports = {
//   solidity: {
//     compilers: [
//       {
//         version: "0.8.30",
//       },
//       {
//         version: "0.6.6",
//       },
//     ],
//   },
