const {
  convertEthToWeth,
  WETH9_Address,
  AMOUNT,
} = require("../scripts/convertEthtoWeth");
const { ethers, getNamedAccounts } = require("hardhat");

async function aaveBorrow() {
  await convertEthToWeth();
  console.log("Borrowing....");
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  const iPool = await getLendingPool(signer);
  await approveErc20(iPool, signer);
  console.log("Depositing....");
  const tx = await iPool.deposit(WETH9_Address, AMOUNT, deployer, 0);
  await tx.wait(1);
  console.log("Deposited!");

  /*
    Now, you have successfully deposited your WETH into Aave's lending pool.
    You should see your WETH balance decrease and your aWETH balance increase in your wallet.
  // iPool.deposit(
  //       address asset,
  //       uint256 amount,
  //       address onBehalfOf,
  //       uint16 referralCode
  //   )
  */

  const { availableBorrowsBase } = await getBorrowUserData(iPool, deployer);

  const daiPrice = await getDaiPrice();

  // const amountDaiToBorrow =
  //   availableBorrowsBase.toString() * 0.95 * (1 / BigInt(daiPrice));

  // const availableBorrowsETH = Number(availableBorrowsBase.toString()) / 1e18;
  // const daiPriceWETH = Number(daiPrice.toString()) / 1e8;
  // const amountDaiToBorrow = (availableBorrowsETH * 0.95) / daiPriceWETH;

  const amountDaiToBorrow =
    Number(availableBorrowsBase.toString()) *
    0.95 *
    (1 / Number(daiPrice.toString()));

  console.log(`You can borrow approximately ${amountDaiToBorrow} DAI`);

  const amountDaiToBorrowWei = ethers.parseEther(amountDaiToBorrow.toString());
  console.log(`You are going to borrow ${amountDaiToBorrowWei} DAI`);

  await borrowDai(amountDaiToBorrowWei, iPool, deployer);
  await getBorrowUserData(iPool, deployer);
  console.log("You are going to repay....");
  await repay(amountDaiToBorrowWei, iPool, signer);
  console.log("You have repaid!");
  await getBorrowUserData(iPool, deployer);
}

async function getLendingPool(signer) {
  const iPoolAddressesProvider = await ethers.getContractAt(
    "IPoolAddressesProvider",
    process.env.MAINNET_AAVE_PROVIDER_ADDRESS,
    signer
  );
  const lendingPoolAddress = await iPoolAddressesProvider.getPool();
  console.log(`Lending Pool Address: ${lendingPoolAddress}`);

  const iPool = await ethers.getContractAt("IPool", lendingPoolAddress, signer);
  console.log("Got the IPool contract!", iPool.target);
  return iPool;
}

async function approveErc20(iPool, signer) {
  console.log("Approving ERC20...");
  /*
  🧩 Why do we need approve?

  When you deposited ETH → WETH, you minted WETH tokens.
  But those tokens live in your wallet.

  Now you want to deposit that WETH into Aave’s Pool contract.
  But the Pool contract cannot just take tokens from your wallet.

  👉 You must give permission (approve) to the Pool contract, telling it:
  "I allow you to pull X amount of my WETH."

   WETH9_Address is the address of the WETH contract
   that contract includes ERC20 functions because WETH is an ERC20 token
   that contract includes the approve function because WETH is an ERC20 token
   that contract includes the transfer function because WETH is an ERC20 token
  */
  const iERC20 = await ethers.getContractAt("IERC20", WETH9_Address, signer);

  // We are approving the Pool contract to spend AMOUNT worth of our WETH
  // on our behalf  (so it can pull the WETH from our wallet to deposit it)

  const tx = await iERC20.approve(iPool.target, AMOUNT);
  await tx.wait();
}

async function getBorrowUserData(iPool, account) {
  const { totalCollateralBase, totalDebtBase, availableBorrowsBase } =
    await iPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralBase} worth of ETH deposited.`);
  console.log(`You have ${totalDebtBase} worth of ETH borrowed.`);
  console.log(`You can borrow ${availableBorrowsBase} worth of ETH.`);
  return { totalCollateralBase, totalDebtBase, availableBorrowsBase };
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
}

async function borrowDai(daiAmountWei, iPool, account) {
  // 2 is the interest rate mode, 1 is stable, 2 is variable
  // daiAddress is the address of the DAI contract on mainnet
  const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const tx = await iPool.borrow(daiAddress, daiAmountWei, 2, 0, account);
  await tx.wait(1);
  console.log("You've borrowed!");
}

async function repay(amount, iPool, account) {
  const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  await approveErc20DuringRepay(iPool, account, amount, daiAddress);
  const tx = await iPool.repay(
    daiAddress,
    amount,
    2,
    await account.getAddress()
  );
  await tx.wait(1);
}

async function approveErc20DuringRepay(
  iPool,
  signer,
  amount,
  erc20AddressOfDAI
) {
  console.log("Approving ERC20...");
  /*
  🧩 Why do we need approve?
  When you want to repay a loan, you need to allow the Aave pool to transfer the DAI tokens from your account to the pool.
  This is done by calling the approve function on the DAI contract, specifying the Aave pool's address and the amount to approve.
  
  erc20AddressOfDAI is the address of the DAI contract
   that contract includes ERC20 functions because DAI is an ERC20 token
   that contract includes the approve function because DAI is an ERC20 token
   that contract includes the transfer function because DAI is an ERC20 token
  
  */
  const iERC20 = await ethers.getContractAt(
    "IERC20",
    erc20AddressOfDAI,
    signer
  );

  // We are approving the Pool contract to spend 'amount' worth of our DAI
  // on our behalf  (so it can pull the DAI from our wallet to repay the loan)

  const tx = await iERC20.approve(iPool.target, amount);
  await tx.wait();
}

aaveBorrow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
