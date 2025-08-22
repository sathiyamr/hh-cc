// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./SimpleStorage.sol";

contract ExtraStorage is SimpleStorage {
    function store(uint256 _fvn) public override {
        favoriteNumber = _fvn + 5;
    }
}
