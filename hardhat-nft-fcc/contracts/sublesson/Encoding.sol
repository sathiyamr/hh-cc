// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Encoding {
    function combineString() public pure returns (string memory) {
        return string(abi.encodePacked("Hi Mom", " How are you "));
    }

    // abi.encodePacked() returns bytes, not a string.
    // abi.encodePacked(...) concatenates their raw bytes into one contiguous bytes array (no padding, no metadata).
    //So the return value is something like:

    //	0x4869204d6f6d20486f772061726520796f75

    // Now you wrap that in:		string(abi.encodePacked(...))
    // Hey, treat these bytes as UTF-8 text, and store them in a string type.

    function encodeNumber() public pure returns (bytes memory) {
        bytes memory number = abi.encode(1);
        return number;
    }

    function encodeString() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("Sathiyamoorthy R");
        return someString;
    }

    /*
        | Function         | Input Type | Output Type | Output Meaning                                       |
        | ---------------- | ---------- | ----------- | ---------------------------------------------------- |
        | `encodeNumber()` | `uint256`  | `bytes`     | ABI-encoded 32-byte representation of number         |
        | `encodeString()` | `string`   | `bytes`     | ABI-encoded representation with offset, length, data |

    */

    function encodeStringPacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked("Sathiyamoorthy R");
        return someString;
    }

    /* returns byes object with lot more saved gas */

    function encodeStringBytes() public pure returns (bytes memory) {
        bytes memory someString = bytes("Sathiyamoorthy R");
        return someString;
    }

    /* above two functions more or less identical but the second one with little bit gas consumption */
    // bytes("Sathiyamoorthy R") is more gas efficient than abi.encodePacked("Sathiyamoorthy R")

    function decodeString() public pure returns (string memory) {
        string memory decodedStr = abi.decode(encodeString(), (string));
        return decodedStr;
    }

    function multiEncode() public pure returns (bytes memory) {
        bytes memory someString = abi.encode(
            "String is Little ",
            "Bit Bigger compared to Original One"
        );
        return someString;
    }

    function multiDecode() public pure returns (string memory, string memory) {
        (string memory stringOne, string memory stringTwo) = abi.decode(
            multiEncode(),
            (string, string)
        );
        return (stringOne, stringTwo);
    }

    function multiEncodePacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked(
            "Hi This is Sathiya",
            "How are you "
        );
        return someString;
    }

    // actually this doesnt work
    function multiDecodePacked() public pure returns (string memory) {
        string memory someString = abi.decode(multiEncodePacked(), (string));
        return someString;
    }

    // This will work

    function multiDecodePackedDup() public pure returns (string memory) {
        string memory someString = string(multiEncodePacked());
        return someString;
    }
}
