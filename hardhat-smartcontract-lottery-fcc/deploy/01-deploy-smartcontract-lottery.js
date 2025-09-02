const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

const { verifyContract } = require("../Utils/verify");

// hre -> hardhat runtime environment
module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;
  const player = (await getNamedAccounts()).player;

  let cordinatorV2Address;
  let subscriptionId;
  let VRFCoordinatorV2_5Mock;

  const VRF_SUB_FUND_AMOUNT = hre.ethers.parseEther("500");
  if (developmentChains.includes(network.name)) {
    // const VRFCoordinatorV2_5Mock = await deployments.get("VRFCoordinatorV2_5Mock");

    // This comes from Hardhat Deploy plugin (hardhat-deploy).
    // It doesn’t give you a contract instance directly — it returns the deployment artifact (an object with details like address, abi, transactionHash, etc).
    /* {
        address: "0x1234...", 
        abi: [...],
        bytecode: "0x...",
        transactionHash: "0x..."
      }
  */

    VRFCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock");

    /* 
      This is also part of hardhat-deploy integration with ethers.
      It directly gives you an ethers Contract instance already connected to the deployer (or default signer).
      With this, you can immediately call functions:
    */

    cordinatorV2Address = VRFCoordinatorV2_5Mock.target;
    // create a subscription
    const transactionResponse =
      await VRFCoordinatorV2_5Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    // subscriptionId = transactionReceipt.events[0].args.subId;

    const event = transactionReceipt.logs
      .map((log) => VRFCoordinatorV2_5Mock.interface.parseLog(log))
      .find((e) => e.name === "SubscriptionCreated");

    /* 
      events[0].args.subId → Quick & dirty, depends on event order.

      parseLog & find → Safer, explicit, best practice.
    */

    subscriptionId = event?.args.subId;
    console.log(
      "Subscription ID:",
      subscriptionId.toString(),
      cordinatorV2Address
    );

    // fund the subscription
    await VRFCoordinatorV2_5Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
    console.log("---");
  } else {
    cordinatorV2Address = networkConfig[chainId].cordinatorV2Address;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  console.log(networkConfig[chainId].nativePayment);
  const args = [
    cordinatorV2Address,
    networkConfig[chainId].entranceFee,
    networkConfig[chainId].gasLane,
    subscriptionId,
    networkConfig[chainId].interval,
    networkConfig[chainId].nativePayment,
  ];

  const Raffle = await deploy("Raffle", {
    contract: "Raffle",
    args: args, // constructor arguments
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // wait for 1 block confirmation
  });
  console.log("----------------------------------------------------");
  if (developmentChains.includes(network.name)) {
    await VRFCoordinatorV2_5Mock.addConsumer(subscriptionId, Raffle.address);
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // Raffle.address is the address of the deployed contract
    console.log("isVerfied");
    await verifyContract(Raffle.address, args);
  }
};

module.exports.tags = ["all", "raffle"];
