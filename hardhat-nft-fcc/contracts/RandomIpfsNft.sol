// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
// import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

/*

    Your contract is inheriting two different “ownership” systems:

    Chainlink’s ConfirmedOwnerWithProposal → via VRFConsumerBaseV2Plus
    This already has its own onlyOwner modifier.

    OpenZeppelin’s Ownable
    Which also has onlyOwner and owner().

*/

error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__withDrawFailed();

contract RandomIpfsNft is VRFConsumerBaseV2Plus, ERC721URIStorage {
    uint256 private s_tokenCounter;
    mapping(uint256 => address) s_requestIdToSender;

    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // IVRFCoordinatorV2Plus private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subscriptionId;
    uint256 private immutable i_interval;
    uint256 private immutable i_mintFee;
    bool private i_nativePayment;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant CALLBACK_GAS_LIMIT = 2500000; // 2,500,000 gas
    uint32 private constant NUM_WORDS = 1;

    uint256 private constant MAX_CHANCE_VALUE = 60;

    event RequestedNft(uint256 indexed rId, address senderAddress);
    event NftMinted(uint256 nftId, Breed dogBreed, address recieverAddress);

    string[] internal s_dogTokenUris;
    bool private s_initialized;

    constructor(
        address vrfCoordinatorV2Plus,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 interval,
        bool nativePayment,
        string[3] memory dogTokenUris,
        uint256 mintFee
    )
        VRFConsumerBaseV2Plus(vrfCoordinatorV2Plus)
        ERC721("Random IPFS NFT", "RIF")
    {
        // i_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2Plus);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_interval = interval;
        i_nativePayment = nativePayment;
        _initializeContract(dogTokenUris);
        i_mintFee = mintFee;
    }

    function requestNft() public payable {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreETHSent();
        }
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: i_nativePayment
                    })
                )
            })
        );

        s_requestIdToSender[requestId] = msg.sender;
        emit RequestedNft(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        // uint256 newItemId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Breed bredFrmModdeRng = getBreedFromModdedRng(moddedRng);

        _safeMint(dogOwner, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_dogTokenUris[uint256(bredFrmModdeRng)]);
        emit NftMinted(s_tokenCounter, bredFrmModdeRng, dogOwner);
    }

    function withDraw() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: contractBalance}("");
        if (!success) {
            revert RandomIpfsNft__withDrawFailed();
        }
    }

    function getBreedFromModdedRng(
        uint256 moddedRng
    ) private pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArr = getChancearray();

        for (uint256 i = 0; i < chanceArr.length; i++) {
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArr[i]
            ) {
                return Breed(i);
            }
            cumulativeSum = chanceArr[i];
        }
        revert("RandomIpfsNft: Range out of bounds");
    }

    function getChancearray() private pure returns (uint256[3] memory) {
        return [uint256(10), uint256(30), MAX_CHANCE_VALUE];
    }

    function _initializeContract(string[3] memory dogTokenUris) private {
        s_dogTokenUris = dogTokenUris;
        s_initialized = true;
    }

    function getDogTokenUris(
        uint256 dogTokenIndex
    ) public view returns (string memory) {
        return s_dogTokenUris[dogTokenIndex];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }
}
