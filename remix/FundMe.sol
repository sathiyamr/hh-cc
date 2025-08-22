// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./PriceConvertor.sol";

error NotOwner();

contract FundMe {
    using PriceConvertor for uint256;
    uint256 public constant MINIMUM_USD = 2 * 1e18;
    // AggregatorV3Interface internal priceFeed;
    address public immutable owner;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    constructor() {
        owner = msg.sender;
        // priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }

    function fund() public payable {
        require(msg.value.getPriceConversionRate() >= MINIMUM_USD, "Does not meet the minimum USD requirement");

        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withDraw() public onlyOwner {
        for(uint256 i = 0; i < funders.length; i++) {
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

        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        //require(callSuccess, "Call Failed");
        if(!callSuccess) {
            revert("Call failed while withdrawing funds");
        }

    }

    receive() external payable { 
        fund();
    }

    fallback() external payable { 
        fund();
    }

    modifier onlyOwner {
        // require(msg.sender == owner, "Not owner");
        // _;
        if(msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function getPriceFn() public view returns (uint256) {
       return PriceConvertor.getPrice();
    }

    function getVersionFn() public view returns (uint256) {
        return PriceConvertor.getVersion();
    }
    
}