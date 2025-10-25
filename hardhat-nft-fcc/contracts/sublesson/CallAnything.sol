// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract CallAnything {
    uint256 public s_balance;
    address public s_owner;

    function transfer(address _to, uint256 _value) public returns (bool) {
        s_balance = _value;
        s_owner = _to;
        return true;
    }

    function getSelectorOne() public pure returns (bytes4) {
        return bytes4(keccak256(bytes("transfer(address,uint256)")));
    }

    function getDataToCallTransfer(
        address _to,
        uint256 _value
    ) public pure returns (bytes memory) {
        return abi.encodeWithSelector(getSelectorOne(), _to, _value);
    }

    function callTransferFunctionDirectly(
        address _to,
        uint256 _value
    ) public returns (bool, bytes4) {
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSelector(getSelectorOne(), _to, _value)
        );
        return (success, bytes4(returnData));
    }

    function callTransferFunctionDirectlySignature(
        address _to,
        uint256 _value
    ) public returns (bool, bytes4) {
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodeWithSignature("transfer(address,uint256)", _to, _value)
        );
        return (success, bytes4(returnData));
    }
}
