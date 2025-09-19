const path = require("path");
const fs = require("fs"); // you'll need this too if you write to files

module.exports = async (hre) => {
  if (process.env.ENABLE_FRONTEEND_UPDATE) {
    console.log("Updating front end...");
    const chainId = hre.network.config.chainId;
    const raffleContract = await ethers.getContract("Raffle");
    const raffleContractAddress = raffleContract.target;

    // Path to the address.json file
    const addressFile = path.join(
      __dirname,
      "../../nextjs-hardhat-smartycontract-lottery-fcc/src/constants/address.json"
    );

    // Read existing JSON (or start with empty object if file missing)
    let currentAddresses = {};
    if (fs.existsSync(addressFile)) {
      currentAddresses = JSON.parse(fs.readFileSync(addressFile, "utf8"));
    }

    // Update or add new chainId -> address mapping
    currentAddresses[chainId] = raffleContractAddress;

    // Write back to file
    fs.writeFileSync(addressFile, JSON.stringify(currentAddresses, null, 2));

    const artifact = await hre.artifacts.readArtifact("Raffle");

    // write ABI to frontend
    const frontendAbiFile = path.join(
      __dirname,
      "../../nextjs-hardhat-smartycontract-lottery-fcc/src/constants/abi.json"
    );
    fs.writeFileSync(frontendAbiFile, JSON.stringify(artifact.abi, null, 2));
  }
};

module.exports.tags = ["all", "font-end-update"];
