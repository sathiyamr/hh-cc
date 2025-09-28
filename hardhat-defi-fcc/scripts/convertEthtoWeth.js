const { ethers, getNamedAccounts } = require("hardhat");

const AMOUNT = ethers.parseEther("10");
console.log(`You are going to convert ${AMOUNT} ETH to WETH`);
const WETH9_Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// above is the mainnet address of WETH9 contract
async function convertEthToWeth() {
  const wethAmount = AMOUNT;
  const { deployer } = await getNamedAccounts();
  console.log("Converting ETH to WETH...", deployer);
  const signer = await ethers.getSigner(deployer);

  /*
    A Signer is the object in ethers.js that can:
    Send transactions
    Sign messages
    Call contracts with write functions
  */

  const iWeth = await ethers.getContractAt("IWETH9", WETH9_Address, signer);
  const tx = await iWeth.deposit({ value: wethAmount });

  /*

    Here’s what happens internally:

      You send 0.02 ETH to the WETH contract.
      The WETH contract mints 0.02 WETH tokens (ERC20 tokens).
      Those tokens are credited to your wallet’s address.
      (Think of WETH as a "receipt token" representing your ETH).

    So after deposit:

      ETH balance decreases by 0.02
      WETH balance increases by 0.02

      ✅ The WETH is still yours, in your wallet — not in Aave yet.
  */
  await tx.wait(1);
  console.log(`Converted ${AMOUNT} ETH to WETH`);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(`WETH Balance: ${wethBalance.toString()}`);
}
module.exports = {
  convertEthToWeth,
  AMOUNT,
  WETH9_Address,
};
