pragma solidity ^0.4.18;

interface IWETH9 {
    // ERC20 standard variables
    function name() external view returns (string);

    function symbol() external view returns (string);

    function decimals() external view returns (uint8);

    // ERC20 functions
    function totalSupply() external view returns (uint);

    function balanceOf(address owner) external view returns (uint);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);

    function transfer(address to, uint value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint value
    ) external returns (bool);

    // WETH-specific functions
    function deposit() external payable;

    function withdraw(uint value) external;

    // Events
    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);
    event Deposit(address indexed dst, uint wad);
    event Withdrawal(address indexed src, uint wad);
}
