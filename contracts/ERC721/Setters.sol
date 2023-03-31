// contracts/Setters.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "./State.sol";

contract XBurnMintERC721Setters is XBurnMintERC721State {
    function setTransferCompleted(bytes32 hash) internal {
        _state.completedTransfers[hash] = true;
    }

    function setTokenImplementation(uint16 chainId, bytes32 tokenContract) internal {
        _state.tokenImplementations[chainId] = tokenContract;
    }

    function setWormhole(address wh) internal {
        _state.wormhole = payable(wh);
    }

    function setFinality(uint8 finality) internal {
        _state.provider.finality = finality;
    }

    function setChainId(uint16 chainId) internal {
        _state.provider.chainId = chainId;
    }

    function setEvmChainId(uint256 evmChainId) internal {
        require(evmChainId == block.chainid, "invalid evmChainId");
        _state.evmChainId = evmChainId;
    }

    function setBaseUri(string memory uri) internal {
        _state.baseUri = uri;
    }

    function setParentChainIdEVM(uint256 chain) internal {
        _state.parentChainIdEVM = chain;
    }

    function incrementCounter() internal {
        _state.counter = _state.counter + 1;
    }
}
