require("dotenv").config();

const networkConfig = {
  11155111: {
    name: "sepolia",
    // priceFeedAddress: process.env.SEPOLIA_PRICE_FEED_ADDRESS,
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
