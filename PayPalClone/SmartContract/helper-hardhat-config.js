require("dotenv").config();

const networkConfig = {
  11155111: {
    name: "sepolia",
    priceFeedAddress: process.env.SEPOLIA_PRICE_FEED_ADDRESS,
  },
};

const developmentChains = ["hardhat", "localhost"];

const INITIAL_ANSWER = "200000000000";
const DECIMAL = 8; // 1 ETH in wei

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_ANSWER,
  DECIMAL,
};
