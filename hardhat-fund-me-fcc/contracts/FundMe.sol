// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import "./PriceConvertor.sol";

import "hardhat/console.sol";

error NotOwner();

contract FundMe {
    using PriceConvertor for uint256;
    uint256 public constant MINIMUM_USD = 2 * 1e18;
    AggregatorV3Interface internal priceFeed;
    address public immutable owner;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    constructor(address priceFeedAddress) {
        owner = msg.sender;

        // Sepolia Testnet Price Feed Address
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getPriceConversionRate(priceFeed) >= MINIMUM_USD,
            "Does not meet the minimum USD requirement"
        );
        // console.log("Owner:", msg.sender);
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withDraw() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funderAddress = funders[i];
            addressToAmountFunded[funderAddress] = 0;
        }
        funders = new address[](0);
        // transfer
        // payable(msg.sender).transfer(address(this).balance);

        // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send Failed");

        // call

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        //require(callSuccess, "Call Failed");
        if (!callSuccess) {
            revert("Call failed while withdrawing funds");
        }
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory fundersCopy = funders;
        for (uint256 i = 0; i < fundersCopy.length; i++) {
            address funderAddress = fundersCopy[i];
            addressToAmountFunded[funderAddress] = 0;
        }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) {
            revert("Call failed while withdrawing funds");
        }
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    modifier onlyOwner() {
        // require(msg.sender == owner, "Not owner");
        // _;
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function getPriceFn() public view returns (uint256) {
        return PriceConvertor.getPrice(priceFeed);
    }

    function getVersionFn() public view returns (uint256) {
        return priceFeed.version();
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
