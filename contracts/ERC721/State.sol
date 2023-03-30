// contracts/State.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import './Structs.sol';

contract XBurnMintERC721Events {
    event bridgeInEvent(
        uint256 tokenId,
        uint256 fromChain,
        uint256 toChain,
        bytes32 indexed toAddress
    );

    event bridgeOutEvent(
        uint256 tokenId,
        uint256 fromChain,
        uint256 toChain,
        bytes32 indexed fromAddress,
        bytes32 indexed toAddress
    );
}

contract XBurnMintERC721Storage {
    struct Provider {
        uint16 chainId;
        // Required number of block confirmations to assume finality
        uint8 finality;
    }

    struct State {
        Provider provider;
        address payable wormhole;
        // Mapping of consumed token transfers
        mapping(bytes32 => bool) completedTransfers;
        // wormhole mapped chains => ERC721 contract addresses
        mapping(uint16 => bytes32) tokenImplementations;
        // EIP-155 Chain ID
        uint256 evmChainId;
        string baseUri;
    }
}

contract XBurnMintERC721State {
    XBurnMintERC721Storage.State _state;
}
