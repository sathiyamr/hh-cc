import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

import { ABI, CONTRACT_ADDRESS } from "./constants/fundMe.js";

const connectToMetaMask = async () => {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected account:", accounts[0]); // first accoun
      document.getElementById("connectButton").innerText =
        "Connected: " + accounts[0];
    } catch (err) {
      if (err.code === 4001) {
        console.log("User rejected connection request");
      } else {
        console.error("Error:", err);
      }
    }
  } else {
    console.log("Please install MetaMask!");
    document.getElementById("connectButton").innerText = "Install MetaMask";
  }
};

const fundWithEth = async () => {
  const ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const network = await provider.getNetwork();

    console.log("Chain ID:", network.chainId.toString());
    console.log("Network Name:", network.name);
    const signer = await provider.getSigner();
    console.log("Signer address:", await signer.getAddress());
    const fundMeContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const tx = await fundMeContract.fund({
      value: ethers.parseEther(ethAmount),
    });
    await transactionToBeMined(tx, provider);
    console.log("Funded with:", ethAmount, "ETH");
    // await tx.wait(1);
    console.log("Done!");
    const contractBalance = await provider.getBalance(fundMeContract.target);
    console.log(
      "Contract balance:",
      ethers.formatEther(contractBalance),
      "ETH"
    );
  }
};

const widthdrawFunds = async () => {
  console.log("Withdrawing funds...");
  const provider = new ethers.BrowserProvider(window.ethereum);

  const network = await provider.getNetwork();

  const signer = await provider.getSigner();
  const fundMeContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const tx = await fundMeContract.withDraw();
  await tx.wait();
  const contractBalance = await provider.getBalance(fundMeContract.target);
  console.log(
    "Contract balance after withdrawal:",
    ethers.formatEther(contractBalance),
    "ETH"
  );
  const signerBalance = await provider.getBalance(signer.address);
  console.log(
    "Signer balance after withdrawal:",
    ethers.formatEther(signerBalance),
    "ETH"
  );
};

const transactionToBeMined = async (transactionResponse, provider) => {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise(async (resolve, reject) => {
    provider.once(transactionResponse.hash, async (transactionReceipt) => {
      const receipt = await transactionResponse.wait(1);
      console.log(
        `Completed with ${await transactionReceipt.confirmations()} confirmations.`
      );
      resolve();
    });
  });
};

document
  .getElementById("connectButton")
  .addEventListener("click", connectToMetaMask);

document.getElementById("fundButton").addEventListener("click", fundWithEth);
document
  .getElementById("withDrawButton")
  .addEventListener("click", widthdrawFunds);
