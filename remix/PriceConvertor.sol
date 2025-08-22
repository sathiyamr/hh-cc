
// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConvertor {
function getPrice() internal view returns (uint256) {
    AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();

        uint256 priceInDecimal = priceFeed.decimals();
        uint256 finalPriceOfEthInDoll = uint256(answer) * (10 ** (18 - priceInDecimal));
        return finalPriceOfEthInDoll;
    }

    function getPriceConversionRate(uint256 ethAmountInWei) internal view returns (uint256) {
        uint256 finalPriceOfEthInDoll = getPrice();
        uint256 ethAmountInUsd = (finalPriceOfEthInDoll * ethAmountInWei) / 1e18;
        return ethAmountInUsd;
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

        return priceFeed.version();
    }
}
