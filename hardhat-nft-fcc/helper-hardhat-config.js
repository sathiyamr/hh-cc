require("dotenv").config();

const networkConfig = {
  11155111: {
    name: "sepolia",
    cordinatorV2Address: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B", // VRF Coordinator V2 address
    entranceFee: "10000000000000000", // 0.01 ETH  is it default in wei?  Yes, it's in wei
    gasLane:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    // 30 gwei key hash what is this?  This is the maximum gas price you are willing to pay for a request is this dummy value?  Yes, it's a dummy value for local testing
    subscriptionId:
      "63772976271374006587194767746946307419895510220462230823869777527966976363795", // add your subscription id here
    interval: "30", // 30 seconds
    nativePayment: false,
    mintFee: "20000000000000000", // 0.02 ETH
    priceFeedAddress: process.env.SEPOLIA_PRICE_FEED_ADDRESS,
  },
  31337: {
    name: "localhost",
    entranceFee: "10000000000000000", // 0.01 ETH  is it default in wei?  Yes, it's in wei
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    // 30 gwei key hash what is this?  This is the maximum gas price you are willing to pay for a request is this dummy value?
    // Yes, it's a dummy value for local testing
    subscriptionId:
      "63772976271374006587194767746946307419895510220462230823869777527966976363795", // add your subscription id here
    interval: "30", // 30 seconds
    nativePayment: false,
    mintFee: "20000000000000000", // 0.02 ETH
  },
};

const INITIAL_ANSWER = "200000000000";
const DECIMAL = 8; // 1 ETH in wei

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_ANSWER,
  DECIMAL,
};
