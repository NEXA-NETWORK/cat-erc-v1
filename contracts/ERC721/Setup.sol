// contracts/BridgeSetup.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import './Setters.sol';

contract XBurnMintERC721Setup is XBurnMintERC721Setters {
    function setup(uint16 chainId, address wormhole, uint8 finality, uint256 evmChainId) public {
        setChainId(chainId);

        setWormhole(wormhole);

        setFinality(finality);

        setEvmChainId(evmChainId);
    }
}
