// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "../libraries/BytesLib.sol";
import "../shared/WormholeStructs.sol";
import "../interfaces/IWormhole.sol";
import "../interfaces/IERC721Extended.sol";
import "../interfaces/ICATERC721Proxy.sol";
import "./Structs.sol";
import "./Governance.sol";

contract CATERC721Proxy is Context, IERC721Receiver, CATERC721Governance, CATERC721Events, ERC165 {
    using BytesLib for bytes;
    using Strings for uint256;

    constructor() {
        setEvmChainId(block.chainid);
    }

    function initialize(
        uint16 chainId,
        address nativeToken,
        address wormhole,
        uint8 finality
    ) public onlyOwner {
        require(isInitialized() == false, "Already Initialized");

        setChainId(chainId);
        setNativeAsset(nativeToken);
        setWormhole(wormhole);
        setFinality(finality);

        setIsInitialized();
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165) returns (bool) {
        return
            interfaceId == type(ICATERC721Proxy).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function bridgeOut(
        uint256 tokenId,
        uint16 _wormholeChainId,
        bytes32 recipient,
        uint32 nonce
    ) external payable returns (uint64) {
        require(isInitialized() == true, "Not Initialized");

        uint256 fee = wormhole().messageFee();
        require(msg.value >= fee, "Not enough fee provided to publish message");

        // Transfer in contract and lock the nft in this contract
        nativeAsset().safeTransferFrom(_msgSender(), address(this), tokenId);

        uint16 tokenChain = chainId();
        bytes32 tokenAddress = addressToBytes(address(this));
        string memory uriString = nativeAsset().tokenURI(tokenId);

        CATERC721Structs.CrossChainPayload memory payload = CATERC721Structs.CrossChainPayload({
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
            addressToBytes(nativeAsset().ownerOf(tokenId)),
            recipient
        );

        return sequence;
    }

    function bridgeIn(bytes calldata encodedVM) external returns (bytes memory) {
        require(isInitialized() == true, "Not Initialized");
        require(evmChainId() == block.chainid, "cannot support forking");

        (WormholeStructs.VM memory vm, bool valid, string memory reason) = wormhole()
            .parseAndVerifyVM(encodedVM);
        require(valid, reason);
        require(
            bytesToAddress(vm.emitterAddress) == address(this) ||
                tokenContracts(vm.emitterChainId) == vm.emitterAddress,
            "Invalid Emitter"
        );

        require(isTransferCompleted(vm.hash) == false, "Already Completed The Transfer");
        setTransferCompleted(vm.hash);

        CATERC721Structs.CrossChainPayload memory transfer = decodeTransfer(vm.payload);
        require(transfer.toChain == chainId(), "invalid target chain");

        address transferRecipient = bytesToAddress(transfer.toAddress);

        // Unlock the nft in this contract and Transfer out from contract to user
        nativeAsset().safeTransferFrom(address(this), transferRecipient, transfer.tokenID);

        emit bridgeInEvent(
            transfer.tokenID,
            transfer.tokenChain,
            transfer.toChain,
            transfer.toAddress
        );

        return vm.payload;
    }
}
