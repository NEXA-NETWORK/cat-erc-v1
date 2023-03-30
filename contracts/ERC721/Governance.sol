// contracts/Bridge.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../libraries/BytesLib.sol";

import "./Getters.sol";
import "./Setters.sol";
import "./Structs.sol";

import "../interfaces/IWormhole.sol";

contract XBurnMintERC721Governance is
    XBurnMintERC721Getters,
    XBurnMintERC721Setters,
    AccessControl
{
    using BytesLib for bytes;

    // Execute a RegisterChain governance message
    function registerChain(uint16 chainId, bytes32 tokenContract) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        setTokenImplementation(chainId, tokenContract);
    }

    function registerChains(uint16[] memory chainId, bytes32[] memory tokenContract) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        require(chainId.length == tokenContract.length, "Invalid Input");
        for (uint256 i = 0; i < tokenContract.length; i++) {
            setTokenImplementation(chainId[i], tokenContract[i]);
        }
    }

    // Execute a RegisterChain governance message
    function updateFinality(uint8 finality) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        setFinality(finality);
    }

    function updateBaseUri(string memory uri) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        setBaseUri(uri);
    }
}
