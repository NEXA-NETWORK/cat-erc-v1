// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICATERC721ParentChain {
    function initialize(
        uint16 chainId,
        address nativeToken,
        address wormhole,
        uint8 finality
    ) external;

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4);

    function bridgeOut(
        uint256 tokenId,
        uint16 _wormholeChainId,
        bytes32 recipient,
        uint32 nonce
    ) external payable returns (uint64);

    function bridgeIn(bytes calldata encodedVM) external returns (bytes memory);
}
