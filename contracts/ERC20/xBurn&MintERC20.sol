// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../shared/WormholeStructs.sol";
import "../interfaces/IWormhole.sol";
import "./Governance.sol";
import "./Structs.sol";

abstract contract NexaERC20  is Context, ERC20, Governance {
    using BytesLib for bytes;

    constructor (uint16 chainId,
        address wormhole,
        uint8 finality,
        uint256 evmChainId
        ) {

        setChainId(chainId);
        
        setWormhole(wormhole);

        setFinality(finality);

        setEvmChainId(evmChainId);
    }

    /**
    * @dev To bridge tokens to other chains.
    */
    function bridgeOut(
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        uint32 nonce
        ) external payable returns (uint64 sequence) {
            uint256 fee = wormhole().messageFee();
            require(msg.value >= fee, "Not enough fee provided to publish message");
            require(
                tokenContracts(recipientChain) != bytes32(0),
                "Recipient Bridge Contract not configured for given chain id"
            );
            uint16 tokenChain = wormhole().chainId();
            bytes32 tokenAddress = bytes32(uint256(uint160(address(this))));
            uint256 normalizedAmount = deNormalizeAmount(normalizeAmount(amount, decimals()), decimals());
            _burn(_msgSender(), normalizedAmount);

        Structs.Transfer memory transfer = Structs.Transfer({
            amount: normalizedAmount,
            tokenAddress: tokenAddress,
            tokenChain: tokenChain,
            to: recipient,
            toChain: recipientChain
        });

        sequence = wormhole().publishMessage{value: msg.value}(
            nonce,
            encodeTransfer(transfer),
            finality()
        );

    } // end of function


    function bridgeIn(bytes memory encodedVm) external  returns (bytes memory) {
        (IWormhole.VM memory vm, bool valid, string memory reason) = wormhole().parseAndVerifyVM(encodedVm);
        require(valid, reason);
        require(
            tokenContracts(vm.emitterChainId) == vm.emitterAddress,
            "Invalid Emitter"
        );

        Structs.Transfer memory transfer = decodeTransfer(vm.payload);
        address transferRecipient = _truncateAddress(transfer.to);

        require(!isTransferCompleted(vm.hash), "transfer already completed");
        setTransferCompleted(vm.hash);

        require(transfer.toChain == wormhole().chainId(), "invalid target chain");

        uint256 nativeAmount = deNormalizeAmount(normalizeAmount(transfer.amount, decimals()), decimals());

        _mint(transferRecipient, nativeAmount);
        return vm.payload;

    }

}