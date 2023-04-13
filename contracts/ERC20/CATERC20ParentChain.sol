// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../shared/WormholeStructs.sol";
import "../interfaces/IWormhole.sol";
import "../interfaces/IERC20Extended.sol";
import "./Governance.sol";
import "./Structs.sol";

contract CATERC20ParentChain is Context, CATERC20Governance, CATERC20Events {
    using BytesLib for bytes;

    constructor() {
        setEvmChainId(block.chainid);
    }

    function initialize(
        uint16 chainId,
        address nativeToken,
        address wormhole,
        uint8 finality
    ) public onlyOwner {
        require(isInitialized() == false, "Already Initialized");

        setChainId(chainId);
        setWormhole(wormhole);
        setFinality(finality);
        setNativeAsset(nativeToken);

        setIsInitialized();
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
        require(isInitialized() == true, "Not Initialized");

        uint256 fee = wormhole().messageFee();
        require(msg.value >= fee, "Not enough fee provided to publish message");
        uint16 tokenChain = wormhole().chainId();
        bytes32 tokenAddress = bytes32(uint256(uint160(address(this))));
        uint256 normalizedAmount = deNormalizeAmount(
            normalizeAmount(amount, nativeAsset().decimals()),
            nativeAsset().decimals()
        );

        // Transfer in contract and lock the tokens in this contract
        nativeAsset().transferFrom(_msgSender(), address(this), normalizedAmount);

        CATERC20Structs.CrossChainPayload memory transfer = CATERC20Structs.CrossChainPayload({
            amount: normalizedAmount,
            tokenAddress: tokenAddress,
            tokenChain: tokenChain,
            toAddress: recipient,
            toChain: recipientChain
        });

        sequence = wormhole().publishMessage{value: msg.value}(
            nonce,
            encodeTransfer(transfer),
            finality()
        );

        emit bridgeOutEvent(
            amount,
            tokenChain,
            recipientChain,
            addressToBytes(_msgSender()),
            recipient
        );
    } // end of function

    function bridgeIn(bytes memory encodedVm) external returns (bytes memory) {
        require(isInitialized() == true, "Not Initialized");

        (IWormhole.VM memory vm, bool valid, string memory reason) = wormhole().parseAndVerifyVM(
            encodedVm
        );
        require(valid, reason);
        require(
            bytesToAddress(vm.emitterAddress) == address(this) ||
                tokenContracts(vm.emitterChainId) == vm.emitterAddress,
            "Invalid Emitter"
        );

        CATERC20Structs.CrossChainPayload memory transfer = decodeTransfer(vm.payload);
        address transferRecipient = bytesToAddress(transfer.toAddress);

        require(!isTransferCompleted(vm.hash), "transfer already completed");
        setTransferCompleted(vm.hash);

        require(transfer.toChain == wormhole().chainId(), "invalid target chain");

        uint256 nativeAmount = deNormalizeAmount(
            normalizeAmount(transfer.amount, nativeAsset().decimals()),
            nativeAsset().decimals()
        );

        // Unlock the tokens in this contract and Transfer out from contract to user
        nativeAsset().transferFrom(address(this), transferRecipient, nativeAmount);

        emit bridgeInEvent(nativeAmount, transfer.tokenChain, transfer.toChain, transfer.toAddress);

        return vm.payload;
    }
}
