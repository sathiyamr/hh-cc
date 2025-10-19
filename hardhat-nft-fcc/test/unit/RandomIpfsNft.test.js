const { expect } = require("chai");
const { deployments, getNamedAccounts, network } = require("hardhat");
const { ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Random-Ipfs-Nft", function () {
      let randomIpfsNft, vrfCoordinatorV2_5Mock, deployer;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
        vrfCoordinatorV2_5Mock = await ethers.getContract(
          "VRFCoordinatorV2_5Mock",
          deployer
        );
        // refer this image regarding - mock - hh-cc/ContractName-Vs-Deploymentname-Hardhat.png
      });

      describe("Constructor", function () {
        it("Initialized the Randon IPFS NFT correctly", async function () {
          const mintFee = await randomIpfsNft.getMintFee();
          expect(mintFee.toString()).to.equal(
            networkConfig[network.config.chainId].mintFee
          );
          const tokenCnter = await randomIpfsNft.getTokenCounter();
          expect(tokenCnter.toString()).to.equal("0");

          const tokenUri = await randomIpfsNft.getDogTokenUris(0);
          expect(tokenUri).to.equal(
            "ipfs://QmUSary3LG7ZvoicFG88pzVfwhBcH3TeDqsHFd1vyFuGbv"
          );
        });
      });

      describe("Request NFT Failure", function () {
        it("Reverts when you don't pay anything", async function () {
          await expect(
            randomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          );
        });
        it("Reverts when you don't pay enough", async function () {
          await expect(
            randomIpfsNft.requestNft({
              value: ethers.parseEther("0.01"),
            })
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          );
        });
      });

      describe("Request NFT Success", function () {
        it("should successfully request an NFT and emit the RequestedNft event", async function () {
          const tx = await randomIpfsNft.requestNft({
            value: ethers.parseEther("0.02"),
          });
          const receipt = await tx.wait(1);
          const event = receipt.logs
            .map((log) => randomIpfsNft.interface.parseLog(log))
            .find((e) => e?.name === "RequestedNft");

          const requestId = event?.args[0];
          expect(Number(requestId)).to.equal(1);
        });
      });
    });
