// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./SimpleStorage.sol";

contract StorageFactory {
    SimpleStorage[] public simpleStoragesArray;

    function createSimpleStorageContract() public {
        SimpleStorage simpleStorage = new SimpleStorage();
        simpleStoragesArray.push(simpleStorage);
    }

    function sfStore(uint256 _simpleStorageIndex, uint256 _simpleStorageNumber) public {
        SimpleStorage simpleStorage = simpleStoragesArray[_simpleStorageIndex];
        simpleStorage.store(_simpleStorageNumber);
    }

    function sfGet(uint256 _simpleStorageIndex) view public returns (uint256) {
        return simpleStoragesArray[_simpleStorageIndex].retrieve();
    }
}