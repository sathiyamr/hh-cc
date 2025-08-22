import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-verify";
import "./tasks/block-number";
import "solidity-coverage";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: false,
    // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  solidity: "0.8.30",
};
