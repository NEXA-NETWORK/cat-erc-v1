// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICATERC20 {
    function initialize(
        uint16 chainId,
        address wormhole,
        uint256 maxSupply
    ) external;

    /**
     * @dev To bridge tokens to other chains.
     */
    function bridgeOut(
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        bytes32 tokenAddress
    ) external payable returns (uint64 sequence);

    function mint(address recipient, uint256 amount) external;
}
