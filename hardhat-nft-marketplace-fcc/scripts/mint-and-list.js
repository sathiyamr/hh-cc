const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const player = (await getNamedAccounts()).player;
  const nftMarketplace = await ethers.getContract("NftMarketplace", deployer); // NftMarketplace contract is deployed under the reference name "NftMarketplace"
  const basicNft = await ethers.getContract("BasicNft", deployer); // BasicNft contract is deployed under the reference name "BasicNft"
  const PRICE = ethers.parseEther("0.02");
  console.log("Miniting.....");
  const mintTx = await basicNft.mintNft();
  const mintTxRecipt = await mintTx.wait(1);
  const transferEvent = mintTxRecipt.logs.find(
    (log) => log.fragment && log.fragment.name === "Transfer"
  );

  const tokenId = transferEvent.args.tokenId;
  console.log("TokenId.... ", tokenId);

  console.log("Approving the token");

  const approveTx = await basicNft.approve(nftMarketplace.target, tokenId);
  await approveTx.wait(1);

  console.log("Listing the token");

  const tx = await nftMarketplace.listItem(basicNft.target, tokenId, PRICE);
  await tx.wait(1);

  console.log("Logging as player");

  const playerConnectedNftMarketPlace = await ethers.getContract(
    "NftMarketplace",
    player
  );
  const txPlayer = await playerConnectedNftMarketPlace.buyItem(
    basicNft.target,
    tokenId,
    {
      value: PRICE,
    }
  );
  const txP = await txPlayer.wait(1);
  const newOwner = await basicNft.ownerOf(tokenId);
  console.log('new Owner', newOwner);
  console.log('player address', player);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
