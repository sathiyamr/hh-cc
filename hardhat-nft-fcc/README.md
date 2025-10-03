# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

Basic NFT

    Just creating NFT - simple one

Random IPFS NFT

    1. Who uploads the images?

        Usually the contract owner / project team uploads the NFT images (or metadata) to IPFS, Arweave, or a centralized server.

        The smart contract typically only stores a URI (link) that points to that metadata.

        So yes — the raw images are not uploaded by random users, but by the creator (owner) of the NFT collection.

    2. What does "minting" mean for users?

        Minting means creating a new NFT token on the blockchain (assigning a new tokenId to a user’s wallet).

        When users mint, they pay ETH (or another token) to the smart contract.

        In return, the contract mints a new token for them and assigns metadata (image/attributes) that the owner already prepared.

        So users do not upload images — they just pay to create a new NFT from the collection that was already set up.

    3. Why does the contract owner get ETH?

        Because the owner (or team) prepared the art, metadata, smart contract, and collection.

        The mint fee (ETH users pay) goes to the contract, and the owner can withdraw it.

    4. Your thought ("owner mints and then sells") is also possible ✅

        There are two common patterns:

        User-Mint Model (most common in NFT drops):

        Owner uploads images/metadata.

        Users call mint() and pay ETH.

        The NFT is minted directly into the user’s wallet.

        Owner-Mint Model (like art galleries):

        Owner mints all NFTs to themselves.

        Then lists them on OpenSea/marketplaces.

        Users buy NFTs from the owner (secondary sale).

        Both are valid — it depends on the project design.

    🔑 Answer to your question:

        Users don’t upload images.

        Owner uploads images & metadata beforehand.

        Users mint NFTs (i.e., pay ETH to create + receive a new token).

        Owner collects the ETH from the contract.

Dynamic SVG NFT
