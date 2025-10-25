const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verifyContract } = require("../Utils/verify");
const fs = require("fs");
const { parseEther } = require("ethers");

module.exports = async (hre) => {
  const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicMintTx = await basicNft.mintNft();
  await basicMintTx.wait(1);
  console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`);

  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();

  await new Promise(async (resolve, reject) => {
    setTimeout(resolve, 300000);
    randomIpfsNft.once("NftMinted", async function () {
      resolve();
    });

    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
      value: mintFee.toString(),
    });
    const randomIpfsNftMintTxReciept = await randomIpfsNftMintTx.wait(1);
    if (developmentChains.includes(network.name)) {
      const event = randomIpfsNftMintTxReciept.logs
        .map((log) => randomIpfsNft.interface.parseLog(log))
        .find((e) => e?.name === "RequestedNft");

      const requestId = event?.args?.[0]?.toString();

      const vrfCoordiantorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2_5Mock",
        deployer
      );

      console.log(requestId);

      await vrfCoordiantorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.target
      );
    }
  });

  console.log(
    `Random NFT index 0 has tokenURI: ${await randomIpfsNft.getDogTokenUris(0)}`
  );

  const highValue = parseEther("0.00000001");
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  const tx = await dynamicSvgNft.mintNft(highValue);
  await tx.wait(1);

  console.log(
    `Dynamic NFT index 0 has tokenURI: ${await dynamicSvgNft.tokenURI(1)}`
  );
};

module.exports.tags = ["all", "mint"];
