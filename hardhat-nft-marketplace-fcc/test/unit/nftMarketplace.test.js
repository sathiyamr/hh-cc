const { expect } = require("chai");
const { deployments, getNamedAccounts, network } = require("hardhat");
const { ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft-Market-Place-test", function () {
      let deployerAddress, playerAddress, nftMarketplace, basicNft;
      const TOKEN_ID = 0;
      const PRICE = ethers.parseEther("0.02");
      const UP_PRICE = ethers.parseEther("0.05");
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        // const { deployer, player } = await getNamedAccounts();
        const accounts = await ethers.getSigners();
        const deployer = accounts[0];
        const player = accounts[1];

        deployerAddress = deployer;
        playerAddress = player;
        nftMarketplace = await ethers.getContract("NftMarketplace", deployer);
        basicNft = await ethers.getContract("BasicNft", deployer);
        await basicNft.mintNft();
      });

      it("Throw error since price is 0", async function () {
        await expect(
          nftMarketplace.listItem(basicNft.target, TOKEN_ID, 0)
        ).to.be.revertedWithCustomError(
          nftMarketplace,
          "NftMarketplace__PriceMustBeAboveZero"
        );
      });

      it("Throw error since not approved ", async function () {
        await expect(
          nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE)
        ).to.be.revertedWithCustomError(
          nftMarketplace,
          "NftMarketplace__NotApprovedForMarketplace"
        );
      });

      it("Lists and can be bought", async function () {
        await basicNft.approve(nftMarketplace.target, TOKEN_ID);
        // The owner of this NFT (basicNft) gives permission to the NFT Marketplace
        // contract (nftMarketplace.target) to transfer or sell this specific NFT
        // (TOKEN_ID) on their behalf.
        await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
        const playerConnectedNftMarketPlace = await nftMarketplace.connect(
          playerAddress
        );
        await playerConnectedNftMarketPlace.buyItem(basicNft.target, TOKEN_ID, {
          value: PRICE,
        });
        const newOwner = await basicNft.ownerOf(TOKEN_ID);
        const proceeds = await nftMarketplace.getProceeds(deployerAddress);
        expect(newOwner).to.equal(playerAddress.address);
        expect(proceeds).to.equal(PRICE);
      });

      it("Lists - NftMarketplace__priceNotMet", async function () {
        await basicNft.approve(nftMarketplace.target, TOKEN_ID);
        // The owner of this NFT (basicNft) gives permission to the NFT Marketplace
        // contract (nftMarketplace.target) to transfer or sell this specific NFT
        // (TOKEN_ID) on their behalf.
        await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
        const playerConnectedNftMarketPlace = await nftMarketplace.connect(
          playerAddress
        );
        await expect(
          playerConnectedNftMarketPlace.buyItem(basicNft.target, TOKEN_ID, {
            value: 0,
          })
        ).to.be.revertedWithCustomError(
          nftMarketplace,
          "NftMarketplace__priceNotMet"
        );
      });

      it("Cancel Listing", async function () {
        await basicNft.approve(nftMarketplace.target, TOKEN_ID);
        // The owner of this NFT (basicNft) gives permission to the NFT Marketplace
        // contract (nftMarketplace.target) to transfer or sell this specific NFT
        // (TOKEN_ID) on their behalf.
        await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
        await expect(nftMarketplace.cancelListing(basicNft.target, TOKEN_ID))
          .to.emit(nftMarketplace, "ItemCancelled")
          .withArgs(
            deployerAddress.address, // msg.sender
            basicNft.target, // nftAddress
            TOKEN_ID // tokenId
          );
      });

      it("Update Listing", async function () {
        await basicNft.approve(nftMarketplace.target, TOKEN_ID);
        // The owner of this NFT (basicNft) gives permission to the NFT Marketplace
        // contract (nftMarketplace.target) to transfer or sell this specific NFT
        // (TOKEN_ID) on their behalf.
        await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
        await expect(
          nftMarketplace.updateListing(basicNft.target, TOKEN_ID, UP_PRICE)
        )
          .to.emit(nftMarketplace, "ItemListed")
          .withArgs(
            deployerAddress.address, // msg.sender
            basicNft.target, // nftAddress
            TOKEN_ID,
            UP_PRICE // tokenId
          );
      });

      it("withDrawProceeds", async function () {
        await basicNft.approve(nftMarketplace.target, TOKEN_ID);
        // The owner of this NFT (basicNft) gives permission to the NFT Marketplace
        // contract (nftMarketplace.target) to transfer or sell this specific NFT
        // (TOKEN_ID) on their behalf.
        await nftMarketplace.listItem(basicNft.target, TOKEN_ID, PRICE);
        const playerConnectedNftMarketPlace = await nftMarketplace.connect(
          playerAddress
        );
        await playerConnectedNftMarketPlace.buyItem(basicNft.target, TOKEN_ID, {
          value: PRICE,
        });

        const beforeBalance = await ethers.provider.getBalance(
          deployerAddress.address
        );
        const txResponse = await nftMarketplace.withDrawProceeds();
        const txReceipt = await txResponse.wait();
        const gasUsed = txReceipt.gasUsed * txReceipt.gasPrice;
        const afterBalance = await ethers.provider.getBalance(deployerAddress.address);

        // Check proceeds reset
        const proceedsAfter = await nftMarketplace.getProceeds(
          deployerAddress.address
        );
        expect(proceedsAfter).to.equal(0);

        // Check balance roughly increased by PRICE (minus gas)
        expect(afterBalance).to.be.closeTo(
          beforeBalance + PRICE - gasUsed,
          PRICE / 1000n
        );
      });
    });
