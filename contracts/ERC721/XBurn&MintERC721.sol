// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../libraries/BytesLib.sol";
import "../shared/WormholeStructs.sol";
import "../interfaces/IWormhole.sol";
import "./ERC721Structs.sol";

contract XBurnMintERC721 is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ERC721BurnableUpgradeable,
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using BytesLib for bytes;
    using StringsUpgradeable for uint256;

    string public baseUri;
    CountersUpgradeable.Counter private _tokenIdCounter;

    // normal chain => wormhole mapped chains
    mapping(uint256 => uint256) public wormholeChainId;
    // wormhole mapped chains => bridge addresses
    mapping(uint256 => address) public wormholeBridge;
    // wormhole mapped chains => ERC721 contract addresses
    mapping(uint256 => address) public ERC721Contract;
    // hash => status of completion
    mapping(bytes32 => bool) public completedTransfers;

    IWormhole public wormhole;

    uint8 public finality;

    event bridgeInEvent(
        uint256 tokenId,
        uint256 fromChain,
        uint256 toChain,
        address indexed fromAddress,
        address indexed toAddress
    );
    event bridgeOutEvent(
        uint256 tokenId,
        uint256 fromChain,
        uint256 toChain,
        address indexed fromAddress,
        address indexed toAddress
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint8 _finality) public initializer {
        __ERC721_init("X-Burn-Mint-Token", "XBMT");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Pausable_init();
        __Ownable_init();
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
        __XBurnMintERC721_init(_finality);
    }

    function __XBurnMintERC721_init(uint8 _finality) internal {
        if (
            block.chainid == 5 ||
            block.chainid == 97 ||
            block.chainid == 80001 ||
            block.chainid == 43113 ||
            block.chainid == 4002 ||
            block.chainid == 421613 ||
            block.chainid == 10
        ) {
            // chain id of evm to wormhole id mapped
            wormholeChainId[5] = 2;
            wormholeChainId[97] = 4;
            wormholeChainId[80001] = 5;
            wormholeChainId[43113] = 6;
            wormholeChainId[4002] = 10;
            wormholeChainId[421613] = 23;
            wormholeChainId[10] = 24;
            // addresses of wormhole core protocol
            wormholeBridge[2] = 0x706abc4E45D419950511e474C7B9Ed348A4a716c;
            wormholeBridge[4] = 0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D;
            wormholeBridge[5] = 0x0CBE91CF822c73C2315FB05100C2F714765d5c20;
            wormholeBridge[6] = 0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C;
            wormholeBridge[10] = 0x1BB3B4119b7BA9dfad76B0545fb3F531383c3bB7;
            wormholeBridge[23] = 0xC7A204bDBFe983FCD8d8E61D02b475D4073fF97e;
            wormholeBridge[24] = 0x6b9C8671cdDC8dEab9c719bB87cBd3e782bA6a35;
        }
        if (
            block.chainid == 1 ||
            block.chainid == 56 ||
            block.chainid == 137 ||
            block.chainid == 43114 ||
            block.chainid == 4262 ||
            block.chainid == 250 ||
            block.chainid == 42161 ||
            block.chainid == 10
        ) {
            // chain id of evm to wormhole id mapped
            wormholeChainId[1] = 2;
            wormholeChainId[56] = 4;
            wormholeChainId[137] = 5;
            wormholeChainId[43114] = 6;
            wormholeChainId[4262] = 7;
            wormholeChainId[250] = 10;
            wormholeChainId[42161] = 23;
            wormholeChainId[10] = 24;
            // addresses of wormhole core protocol
            wormholeBridge[2] = 0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B;
            wormholeBridge[4] = 0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B;
            wormholeBridge[5] = 0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7;
            wormholeBridge[6] = 0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c;
            wormholeBridge[7] = 0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585;
            wormholeBridge[10] = 0x126783A6Cb203a3E35344528B26ca3a0489a1485;
            wormholeBridge[23] = 0xa5f208e072434bC67592E4C49C1B991BA79BCA46;
            wormholeBridge[24] = 0xEe91C335eab126dF5fDB3797EA9d6aD93aeC9722;
        }
        // contract mapping
        ERC721Contract[wormholeChainId[block.chainid]] = address(this);
        finality = _finality;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    )
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function setWormholeChainIds(
        uint256[] memory chains,
        uint256[] memory wormholeChains
    ) public onlyOwner {
        require(chains.length == wormholeChains.length, "Invalid Input");
        for (uint256 i = 0; i < chains.length; i++) {
            wormholeChainId[chains[i]] = wormholeChains[i];
        }
    }

    function setWormholeBridge(
        uint256[] memory wormholeChains,
        address[] memory bridgesAddress
    ) public onlyOwner {
        require(
            wormholeChains.length == bridgesAddress.length,
            "Invalid Input"
        );
        for (uint256 i = 0; i < wormholeChains.length; i++) {
            wormholeBridge[wormholeChains[i]] = bridgesAddress[i];
        }
    }

    function setERC721Contract(
        uint256[] memory wormholeChains,
        address[] memory ERC721ContractAddresses
    ) public onlyOwner {
        require(
            wormholeChains.length == ERC721ContractAddresses.length,
            "Invalid Input"
        );
        for (uint256 i = 0; i < wormholeChains.length; i++) {
            ERC721Contract[wormholeChains[i]] = ERC721ContractAddresses[i];
        }
    }

    function setFinality(uint8 _finality) public onlyOwner {
        finality = _finality;
    }

    function setBaseURI(string memory newUri)
        public
        onlyOwner
        returns (string memory)
    {
        baseUri = newUri;
        return baseUri;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function bridgeOut(
        uint256 tokenId,
        uint16 _wormholeChainId,
        address recipient,
        uint32 nonce
    ) public payable returns (uint64) {
        wormhole = IWormhole(wormholeBridge[wormholeChainId[block.chainid]]);
        uint256 fee = wormhole.messageFee();
        require(msg.value >= fee, "Not enough fee provided to publish message");
        require(
            wormholeBridge[_wormholeChainId] != address(0),
            "Wormhole Bridge not configured for given chain id"
        );

        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not token owner nor approved"
        );

        uint16 tokenChain = uint16(wormholeChainId[block.chainid]);
        bytes32 tokenAddress = bytes32(
            uint256(
                uint160(address(ERC721Contract[wormholeChainId[block.chainid]]))
            )
        );
        bytes32 recipientAddress = bytes32(
            uint256(uint160(address(recipient)))
        );
        string memory uriString = tokenURI(tokenId);

        XBurnMintERC721Structs.CrossChainPayload
            memory payload = XBurnMintERC721Structs.CrossChainPayload({
                tokenAddress: tokenAddress,
                tokenChain: tokenChain,
                tokenID: tokenId,
                uri: uriString,
                toAddress: recipientAddress,
                toChain: _wormholeChainId
            });

        require(
            bytes(payload.uri).length <= 200,
            "tokenURI must not exceed 200 bytes"
        );

        bytes memory encoded = abi.encodePacked(
            uint8(1),
            payload.tokenAddress,
            payload.tokenChain,
            payload.tokenID,
            uint8(bytes(payload.uri).length),
            payload.uri,
            payload.toAddress,
            payload.toChain
        );

        uint64 sequence = wormhole.publishMessage{value: msg.value}(
            nonce,
            encoded,
            finality
        );

        burn(tokenId);
        emit bridgeOutEvent(
            payload.tokenID,
            payload.tokenChain,
            payload.toChain,
            recipient,
            recipient
        );
        return sequence;
    }

    function bridgeIn(bytes calldata encodedVM) public {
        wormhole = IWormhole(wormholeBridge[wormholeChainId[block.chainid]]);
        (
            WormholeStructs.VM memory vm,
            bool valid,
            string memory reason
        ) = wormhole.parseAndVerifyVM(encodedVM);
        require(valid, reason);
        require(
            bytes32(uint256(uint160(ERC721Contract[vm.emitterChainId]))) ==
                vm.emitterAddress,
            "Invalid Emitter"
        );
        require(
            completedTransfers[vm.hash] == false,
            "Already Completed The Transfer"
        );
        completedTransfers[vm.hash] = true;

        XBurnMintERC721Structs.CrossChainPayload memory transfer = parsePayload(
            vm.payload
        );
        require(
            transfer.toChain == wormholeChainId[block.chainid],
            "invalid target chain"
        );

        address transferRecipient = address(
            uint160(uint256(transfer.toAddress))
        );
        _mint(transferRecipient, transfer.tokenID);
        _setTokenURI(transfer.tokenID, transfer.uri);
        emit bridgeInEvent(
            transfer.tokenID,
            transfer.tokenChain,
            transfer.toChain,
            transferRecipient,
            transferRecipient
        );
    }

    function parsePayload(bytes memory encoded)
        public
        pure
        returns (XBurnMintERC721Structs.CrossChainPayload memory transfer)
    {
        uint256 index = 0;

        uint8 payloadID = encoded.toUint8(index);
        index += 1;

        require(payloadID == 1, "invalid Transfer");

        transfer.tokenAddress = encoded.toBytes32(index);
        index += 32;

        transfer.tokenChain = encoded.toUint16(index);
        index += 2;

        transfer.tokenID = encoded.toUint256(index);
        index += 32;

        // Ignore length due to malformatted payload
        index += 1;
        transfer.uri = string(
            encoded.slice(index, encoded.length - index - 34)
        );

        // From here we read backwards due malformatted package
        index = encoded.length;

        index -= 2;
        transfer.toChain = encoded.toUint16(index);

        index -= 32;
        transfer.toAddress = encoded.toBytes32(index);
    }

    function mint(address to) public {
        require(
            block.chainid == 43113 || block.chainid == 43114,
            "Only Minting Allowed on Fuji or AVAX"
        );
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        string memory uriToSet = string(
            abi.encodePacked(baseUri, tokenId.toString())
        );
        _setTokenURI(tokenId, uriToSet);
    }

    function mintMultiple(address to, uint256 amount) public {
        require(amount <= 10, "Can only mint 10 at a time max");
        for (uint256 i = 0; i < amount; i++) {
            mint(to);
        }
    }
}
