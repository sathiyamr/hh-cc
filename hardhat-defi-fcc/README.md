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

# Aave Lending Flow

## 1. Deposit (Supply Collateral)

- Choose a token you already own (like **WETH**, **USDC**, or **DAI**).
- **Approve** Aave’s Pool contract to use that token.
- **Deposit** (supply) the token into the Aave pool.

After deposit:

- You still own the token, but it is **locked as collateral**.
- You receive **aTokens** (e.g., `aWETH`) that represent your share in the pool and automatically accrue interest.

---

## 2. Borrow

- Because you supplied collateral, Aave gives you **borrowing power**.
- You can **borrow another token** (for example, `USDC`) against your `WETH` collateral.
- Choose your interest rate type:
  - **Stable** (fixed-like rate).
  - **Variable** (fluctuates with market conditions).
- Aave monitors your **Health Factor** (safety of your collateral vs. your debt).

---

## 3. Repay

- To close your debt, you **repay** what you borrowed (plus interest).
- Once your loan is repaid:
  - Your **collateral is unlocked**.
  - You can **withdraw your original tokens** (e.g., `WETH`).

---
