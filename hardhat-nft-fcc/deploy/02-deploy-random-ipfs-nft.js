const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verifyContract } = require("../Utils/verify");
const { storeImages, storeTokenUriMetada } = require("../Utils/uploadToPinata");
require("dotenv").config();

const imagesFilePath = "../images/randomNft";
const defaultMetada = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;

  let cordinatorV2Address;
  let subscriptionId;
  let VRFCoordinatorV2_5Mock;

  const VRF_SUB_FUND_AMOUNT = hre.ethers.parseEther("500");
  if (developmentChains.includes(network.name)) {
    VRFCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock");

    cordinatorV2Address = VRFCoordinatorV2_5Mock.target;
    const transactionResponse =
      await VRFCoordinatorV2_5Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);

    const event = transactionReceipt.logs
      .map((log) => VRFCoordinatorV2_5Mock.interface.parseLog(log))
      .find((e) => e.name === "SubscriptionCreated");

    subscriptionId = event?.args.subId;
    console.log(
      "Subscription ID:",
      subscriptionId.toString(),
      cordinatorV2Address
    );

    await VRFCoordinatorV2_5Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    cordinatorV2Address = networkConfig[chainId].cordinatorV2Address;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }
  let tokenUris = [
    "ipfs://QmUSary3LG7ZvoicFG88pzVfwhBcH3TeDqsHFd1vyFuGbv",
    "ipfs://QmR29pCgLmezKVuw4vf4jksvoEKLzFZz8RiZwWWa22KWHa",
    "ipfs://QmNt1TsJtXw6rE6hAQbmSWXCS6BmS7N6YYfrCtTekB6aek",
  ];
  if (process.env.UPLOAD_TO_PINATA === "true") {
    tokenUris = await handleTokenUris();
  }

  const args = [
    cordinatorV2Address,
    networkConfig[chainId].gasLane,
    subscriptionId,
    networkConfig[chainId].nativePayment,
    tokenUris,
    networkConfig[chainId].mintFee,
  ];

  console.log("args", args);

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    contract: "RandomIpfsNft",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // wait for 1 block confirmation
  });

  if (developmentChains.includes(network.name)) {
    await VRFCoordinatorV2_5Mock.addConsumer(
      subscriptionId,
      randomIpfsNft.address
    );
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // randomIpfsNft.address is the address of the deployed contract

    await verifyContract(randomIpfsNft.address, args);
  }
};

async function handleTokenUris() {
  let tokenUris = [];
  // Store the Images in IPFS
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesFilePath
  );
  for (let imageUploadResponsesIndexes in imageUploadResponses) {
    console.log(`Working on ${imageUploadResponsesIndexes} `);
    const metaDt = { ...defaultMetada };
    metaDt.name = files[imageUploadResponsesIndexes].replace(".png", "");
    metaDt.description = `An adorable ${metaDt.name} dog!!!`;
    metaDt.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndexes].IpfsHash}`;
    const metaDataUploadResponse = await storeTokenUriMetada(metaDt);
    tokenUris.push(`ipfs://${metaDataUploadResponse.IpfsHash}`);
    console.log(`final IPFS on ${metaDataUploadResponse.IpfsHash} `);
  }
  // Store the metadata in IPFS

  return tokenUris;
}

module.exports.tags = ["all", "randomnft", "main"];
