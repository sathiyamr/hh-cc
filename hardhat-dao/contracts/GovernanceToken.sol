// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

// Therefore, all public, internal, and override functions from ERC20 are available.

contract GovernanceToken is ERC20Votes {
    uint256 public constant MAX_SUPPLY = 100 * 10 ** 18;

    constructor()
        ERC20("GovernanceToken", "GT")
        EIP712("GovernanceToken", "1")
    {
        _mint(msg.sender, MAX_SUPPLY);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20Votes) {
        super._update(from, to, value);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
