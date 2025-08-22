const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const fundMe = await ethers.getContract("FundMe", deployer); // FundMe contract is deployed under the reference name "FundMe"
  const sendValue = ethers.parseEther("0.003"); // 0.003 ETH
  const transactionResponse = await fundMe.fund({
    value: sendValue,
  });
  await transactionResponse.wait(1); // wait for 1 block confirmation
  const contractBalance = await ethers.provider.getBalance(fundMe.target);
  console.log(
    `Contract balance after sending the contract: ${ethers.formatEther(contractBalance)} ETH`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
