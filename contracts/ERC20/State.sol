// contracts/State.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "./Structs.sol";

contract Storage {

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

        // Mapping of token contracts on other chains
        mapping(uint16 => bytes32) tokenImplementations;

        // EIP-155 Chain ID
        uint256 evmChainId;
    }
}

contract TokenState {
    Storage.State _state;
}
