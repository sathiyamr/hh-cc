// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageUri;
    string private i_highImageUri;

    AggregatorV3Interface internal immutable i_priceFeed;

    mapping(uint256 => int256) public s_tokenIdToHighValue;

    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";

    string private constant base64EncodedJsonPrefix =
        "data:application/json;base64,";

    event CreatedEvent(uint256 tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_lowImageUri = lowSvg;
        i_highImageUri = highSvg;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function mintNft(int256 highValue) public {
        s_tokenCounter += 1;

        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedEvent(s_tokenCounter, highValue);
    }

    function getTokenCount() public view returns (uint256) {
        return s_tokenCounter;
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(svg));
        // bytes memory svgBytes = bytes(svg);
        // Solidity converts your string into a sequence of bytes.
        // 1 byte = 8 bits = 2 hex digits.
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    // function tokenURI(
    //     uint256 tokenId
    // ) public view override returns (string memory) {
    //     _requireOwned(tokenId);

    //     (
    //         ,
    //         /* uint80 roundId */ int256 price /*uint256 startedAt*/ /*uint256 updatedAt*/ /*uint80 answeredInRound*/,
    //         ,
    //         ,

    //     ) = i_priceFeed.latestRoundData();

    //     string memory imageURI = i_lowImageUri;
    //     if (price >= s_tokenIdToHighValue[tokenId]) {
    //         imageURI = i_highImageUri;
    //     }
    //     return
    //         string(
    //             abi.encodePacked(
    //                 base64EncodedJsonPrefix,
    //                 Base64.encode(
    //                     bytes(
    //                         abi.encodePacked(
    //                             '{"name":"',
    //                             name(),
    //                             '", "description":"An NFT that changes based on the Chainlink feed", ',
    //                             '"attributes":[{"trait_type":"coolness","value":100}], "image":"',
    //                             svgToImageURI(imageURI),
    //                             '"}'
    //                         )
    //                     )
    //                 )
    //             )
    //         );
    // }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        (
            ,
            // roundId
            int256 price, // answer // startedAt // updatedAt
            ,
            ,

        ) = i_priceFeed.latestRoundData();

        string memory imageURI = i_lowImageUri;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageUri;
        }

        // Convert int256 price to string
        string memory priceStr = Strings.toString(uint256(price));
        string memory highValueStr = Strings.toString(
            uint256(s_tokenIdToHighValue[tokenId])
        );

        // Build JSON metadata
        string memory json = string(
            abi.encodePacked(
                base64EncodedJsonPrefix,
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name(),
                            '", "description":"An NFT that changes based on the Chainlink feed", ',
                            '"attributes":[{"trait_type":"coolness","value":100}], ',
                            '"image":"',
                            svgToImageURI(imageURI),
                            '", "price": "',
                            priceStr,
                            '", "highValue": "',
                            highValueStr,
                            '"}'
                        )
                    )
                )
            )
        );

        return json;
    }
}

/*

Bytes and Hexadecimal are Representations of the Same Thing

| Representation      | Meaning                       |
| ------------------- | ----------------------------- |
| Binary: `01001000`  | The raw bits in memory        |
| Decimal: `72`       | The number form of that byte  |
| Hexadecimal: `0x48` | A compact human-readable form |
| Character: `"H"`    | The visual symbol             |


*/
