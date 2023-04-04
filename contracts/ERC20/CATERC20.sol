// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../shared/WormholeStructs.sol";
import "../interfaces/IWormhole.sol";
import "./Governance.sol";
import "./Structs.sol";

contract CATERC20 is Context, ERC20, CATERC20Governance, CATERC20Events {
    using BytesLib for bytes;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        setEvmChainId(block.chainid);
    }

    function initialize(
        uint256 parentChainIdEVM,
        uint16 chainId,
        address nativeToken,
        address wormhole,
        uint8 finality
    ) public onlyOwner {
        require(isInitialized() == false, "Already Initialized");

        setChainId(chainId);
        setWormhole(wormhole);
        setFinality(finality);
        setParentChainIdEVM(parentChainIdEVM);
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
        require(
            tokenContracts(recipientChain) != bytes32(0),
            "Recipient Bridge Contract not configured for given chain id"
        );
        uint16 tokenChain = wormhole().chainId();
        bytes32 tokenAddress = bytes32(uint256(uint160(address(this))));
        uint256 normalizedAmount = deNormalizeAmount(
            normalizeAmount(amount, decimals()),
            decimals()
        );
        _burn(_msgSender(), normalizedAmount);

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
        require(tokenContracts(vm.emitterChainId) == vm.emitterAddress, "Invalid Emitter");

        CATERC20Structs.CrossChainPayload memory transfer = decodeTransfer(vm.payload);
        address transferRecipient = bytesToAddress(transfer.toAddress);

        require(!isTransferCompleted(vm.hash), "transfer already completed");
        setTransferCompleted(vm.hash);

        require(transfer.toChain == wormhole().chainId(), "invalid target chain");

        uint256 nativeAmount = deNormalizeAmount(
            normalizeAmount(transfer.amount, decimals()),
            decimals()
        );

        _mint(transferRecipient, nativeAmount);

        emit bridgeInEvent(nativeAmount, transfer.tokenChain, transfer.toChain, transfer.toAddress);

        return vm.payload;
    }

    function wrap(uint256 _amount, address _recipient) public {
        require(isInitialized() == true, "Not Initialized");

        require(nativeAsset() != address(0), "native token not set");
        require(block.chainid == parentChainIdEVM(), "only parent chain wrapping allowed");
        IERC20 token = IERC20(nativeAsset());

        require(token.allowance(msg.sender, address(this)) >= _amount, "not enough allowance");
        require(token.balanceOf(msg.sender) >= _amount, "low balance");

        token.transferFrom(msg.sender, address(this), _amount);
        _mint(_recipient, _amount);
    }

    function unwrap(uint256 _amount, address _recipient) public {
        require(isInitialized() == true, "Not Initialized");

        IERC20 token = IERC20(nativeAsset());

        _burn(msg.sender, _amount);
        token.transfer(_recipient, _amount);
    }
}
