// contracts/Getters.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "../interfaces/IWormhole.sol";

import "./State.sol";
import "../libraries/BytesLib.sol";

contract Getters is TokenState {

    using BytesLib for bytes;

    function isTransferCompleted(bytes32 hash) public view returns (bool) {
        return _state.completedTransfers[hash];
    }

    function wormhole() public view returns (IWormhole) {
        return IWormhole(_state.wormhole);
    }

    function chainId() public view returns (uint16){
        return _state.provider.chainId;
    }

    function evmChainId() public view returns (uint256) {
        return _state.evmChainId;
    }

    function tokenContracts(uint16 chainId_) public view returns (bytes32){
        return _state.tokenImplementations[chainId_];
    }

    function finality() public view returns (uint8) {
        return _state.provider.finality;
    }

    function normalizeAmount(uint256 amount, uint8 decimals) internal pure returns(uint256){
        if (decimals > 8) {
            amount /= 10 ** (decimals - 8);
        }
        return amount;
    }

    function deNormalizeAmount(uint256 amount, uint8 decimals) internal pure returns(uint256){
        if (decimals > 8) {
            amount *= 10 ** (decimals - 8);
        }
        return amount;
    }

    /*
     * @dev Truncate a 32 byte array to a 20 byte address.
     *      Reverts if the array contains non-0 bytes in the first 12 bytes.
     *
     * @param bytes32 bytes The 32 byte array to be converted.
     */
    function _truncateAddress(bytes32 b) internal pure returns (address) {
        require(bytes12(b) == 0, "invalid EVM address");
        return address(uint160(uint256(b)));
    }

    function encodeTransfer(Structs.Transfer memory transfer) public pure returns (bytes memory encoded) {
        encoded = abi.encodePacked(
            transfer.amount,
            transfer.tokenAddress,
            transfer.tokenChain,
            transfer.to,
            transfer.toChain
        );
    }

    function decodeTransfer(bytes memory encoded) public pure returns (Structs.Transfer memory transfer) {
        uint index = 0;

        transfer.amount = encoded.toUint256(index);
        index += 32;

        transfer.tokenAddress = encoded.toBytes32(index);
        index += 32;

        transfer.tokenChain = encoded.toUint16(index);
        index += 2;

        transfer.to = encoded.toBytes32(index);
        index += 32;

        transfer.toChain = encoded.toUint16(index);
        index += 2;

        require(encoded.length == index, "invalid Transfer");
    }
}
