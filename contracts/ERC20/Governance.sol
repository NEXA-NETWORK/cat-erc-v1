// contracts/Bridge.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../libraries/BytesLib.sol";

import "./Getters.sol";
import "./Setters.sol";
import "./Structs.sol";

import "../interfaces/IWormhole.sol";

contract Governance is Getters, Setters, AccessControl {
    using BytesLib for bytes;

    // Execute a RegisterChain governance message
    function registerChain(uint16 chainId, bytes32 tokenContract) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        setTokenImplementation(chainId, tokenContract);
    }

    // Execute a RegisterChain governance message
    function updateFinality(uint8 finality) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Caller is not a admin");
        setFinality(finality);
    }
}
