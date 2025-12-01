import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy-ethers";
import dotenv from "dotenv";

import "hardhat/types/config";

declare module "hardhat/types/config" {
  interface HttpNetworkUserConfig {
    blockConfirmations?: number;
    confirmations?: number;
  }
}

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.30",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.0",
      },
    ],
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  networks: {
    localhost: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      blockConfirmations: 6,
      timeout: 120000,
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: false,
  },
  mocha: {
    timeout: 300000,
  },
};

export default config;