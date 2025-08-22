// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



contract FallbackTester {
    event FallbackCalled(bytes data);
    event ReceiveCalled();
    event DecodedUint(uint256 value);

    fallback() external payable {
        emit FallbackCalled(msg.data);

        // Try decoding msg.data to uint256
        // This will only work if the msg.data is ABI-encoded like abi.encode(123)
        if (msg.data.length >= 32) {
            uint256 value = abi.decode(msg.data, (uint256));
            emit DecodedUint(value);
        }
    }

    receive() external payable {
        emit ReceiveCalled();
    }
}

contract Caller {
    function callUnknown(address target) public {
        (bool success, ) = target.call(
            abi.encodeWithSignature("unknownFunction(uint256)", 123)
        );
        require(success, "Call failed");
    }
}
