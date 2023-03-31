// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../libraries/BytesLib.sol";
import "../shared/WormholeStructs.sol";
import "../interfaces/IWormhole.sol";
import "./Structs.sol";
import "./Governance.sol";

abstract contract XBurnMintERC721 is
    Context,
    ERC721,
    ERC721Burnable,
    ERC721URIStorage,
    ERC721Enumerable,
    XBurnMintERC721Governance,
    XBurnMintERC721Events
{
    using BytesLib for bytes;
    using Strings for uint256;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri,
        uint256 parentChainIdEVM,
        uint16 chainId,
        address wormhole
    ) ERC721(name, symbol) Ownable() {
        setChainId(chainId);
        setWormhole(wormhole);
        setFinality(1);
        setEvmChainId(block.chainid);
        setBaseUri(baseUri);
        setParentChainEVM(parentChainIdEVM);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function bridgeOut(
        uint256 tokenId,
        uint16 _wormholeChainId,
        bytes32 recipient,
        uint32 nonce
    ) external payable returns (uint64) {
        uint256 fee = wormhole().messageFee();
        require(msg.value >= fee, "Not enough fee provided to publish message");
        require(
            tokenContracts(_wormholeChainId) != bytes32(0),
            "Recipient Bridge Contract not configured for given chain id"
        );

        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not token owner nor approved"
        );

        uint16 tokenChain = chainId();
        bytes32 tokenAddress = addressToBytes(address(this));
        string memory uriString = tokenURI(tokenId);

        XBurnMintERC721Structs.CrossChainPayload memory payload = XBurnMintERC721Structs
            .CrossChainPayload({
                tokenAddress: tokenAddress,
                tokenChain: tokenChain,
                tokenID: tokenId,
                uri: uriString,
                toAddress: recipient,
                toChain: _wormholeChainId
            });

        require(bytes(payload.uri).length <= 200, "tokenURI must not exceed 200 bytes");

        bytes memory encoded = encodeTransfer(payload);

        uint64 sequence = wormhole().publishMessage{value: msg.value}(nonce, encoded, finality());

        emit bridgeOutEvent(
            payload.tokenID,
            payload.tokenChain,
            payload.toChain,
            addressToBytes(ownerOf(tokenId)),
            recipient
        );

        burn(tokenId);
        return sequence;
    }

    function bridgeIn(bytes calldata encodedVM) external returns (bytes memory) {
        (WormholeStructs.VM memory vm, bool valid, string memory reason) = wormhole()
            .parseAndVerifyVM(encodedVM);
        require(valid, reason);
        require(tokenContracts(vm.emitterChainId) == vm.emitterAddress, "Invalid Emitter");

        require(isTransferCompleted(vm.hash) == false, "Already Completed The Transfer");
        setTransferCompleted(vm.hash);

        XBurnMintERC721Structs.CrossChainPayload memory transfer = decodeTransfer(vm.payload);
        require(transfer.toChain == chainId(), "invalid target chain");

        address transferRecipient = bytesToAddress(transfer.toAddress);

        _mint(transferRecipient, transfer.tokenID);
        _setTokenURI(transfer.tokenID, transfer.uri);

        emit bridgeInEvent(
            transfer.tokenID,
            transfer.tokenChain,
            transfer.toChain,
            transfer.toAddress
        );

        return vm.payload;
    }

    function mint(address to) public onlyOwner {
        require(block.chainid == parentChainIdEVM(), "Only Minting Allowed on Parent Chain");
        uint256 tokenId = counter();
        incrementCounter();
        _safeMint(to, tokenId);
        string memory uriToSet = string(abi.encodePacked(baseUri(), tokenId.toString()));
        _setTokenURI(tokenId, uriToSet);
    }
}
