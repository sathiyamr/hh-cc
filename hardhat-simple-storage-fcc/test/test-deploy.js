const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SimpleStorage", function () {
  let simpleStorageFactory, simpleStorage;
  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve();
    const expectedValue = "0";
    expect(currentValue.toString()).to.equal(expectedValue);
  });
  it("Should update the favorite number when we call store", async function () {
    const expectedValue = "42";
    const transactionResponse = await simpleStorage.store(expectedValue);
    const currentValue = await simpleStorage.retrieve();
    expect(currentValue.toString()).to.equal(expectedValue);
  });
});
