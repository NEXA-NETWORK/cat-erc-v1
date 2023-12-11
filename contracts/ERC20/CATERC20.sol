// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "../interfaces/IWormholeReceiver.sol";
import "../interfaces/ICATERC20.sol";
import "./Governance.sol";
import "./Structs.sol";

contract CATERC20 is Context, ERC20, CATERC20Governance, CATERC20Events, ERC165, IWormholeReceiver {
    using SafeERC20 for IERC20;

    constructor(string memory name, string memory symbol, uint8 decimal) ERC20(name, symbol) {
        setEvmChainId(block.chainid);
        setDecimals(decimal);
    }

    function initialize(
        uint16 chainId,
        address wormhole,
        uint256 maxSupply
    ) public onlyOwner {
        require(isInitialized() == false, "Already Initialized");

        setChainId(chainId);
        setWormhole(wormhole);
        setMaxSupply(maxSupply);
        setMintedSupply(0);
        setIsInitialized();
    }

    function decimals() public view virtual override returns (uint8) {
        return getDecimals();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165) returns (bool) {
        return interfaceId == type(ICATERC20).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev To bridge tokens to other chains.
     */
    function bridgeOut(
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        bytes32 tokenAddress
    ) external payable returns (uint64 sequence) {
        require(isInitialized() == true, "Not Initialized");
        require(evmChainId() == block.chainid, "unsupported fork");

        (uint256 cost, ) = wormhole().quoteEVMDeliveryPrice(recipientChain, 0, 300000);
        require(msg.value >= cost, "Insufficient wormhole gas");
        
        uint16 tokenChain = chainId();

        _burn(_msgSender(), amount);

        CATERC20Structs.CrossChainPayload memory transfer = CATERC20Structs.CrossChainPayload({
            amount: amount,
            tokenAddress: tokenAddress,
            tokenChain: tokenChain,
            toAddress: recipient,
            toChain: recipientChain,
            tokenDecimals: getDecimals()
        });

        sequence = wormhole().sendPayloadToEvm{value: cost}(
            recipientChain,
            bytesToAddress(tokenAddress),
            encodeTransfer(transfer),
            0,
            300000,
            chainId(),
            msg.sender
        );

        emit bridgeOutEvent(
            amount,
            tokenChain,
            recipientChain,
            addressToBytes(_msgSender()),
            recipient
        );
    } // end of function

    function bridgeIn(bytes memory encodedPayload, bytes32 deliveryHash) internal returns (bytes memory) {
        CATERC20Structs.CrossChainPayload memory transfer = decodeTransfer(encodedPayload);
        address transferRecipient = bytesToAddress(transfer.toAddress);

        require(!isTransferCompleted(deliveryHash), "transfer already completed");
        setTransferCompleted(deliveryHash);

        require(transfer.toChain == chainId(), "invalid target chain");

        uint256 nativeAmount = normalizeAmount(
            transfer.amount,
            transfer.tokenDecimals,
            getDecimals()
        );

        _mint(transferRecipient, nativeAmount);

        emit bridgeInEvent(nativeAmount, transfer.tokenChain, transfer.toChain, transfer.toAddress);

        return encodedPayload;
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 srcAddress,
        uint16 srcChain,
        bytes32 deliveryHash
    ) external payable override {
        require(isInitialized() == true, "Not Initialized");
        require(evmChainId() == block.chainid, "unsupported fork");

        require(
            bytesToAddress(srcAddress) == address(this) ||
                tokenContracts(srcChain) == srcAddress,
            "Invalid Emitter"
        );

        bridgeIn(payload, deliveryHash);
    }

    /**
     * @dev To calculate the cross chain transfer fee.
     */
    function wormholeEstimatedFee(
        uint16 recipientChain
    ) public view returns (uint256) {
        require(isInitialized() == true, "Not Initialized");
        require(evmChainId() == block.chainid, "unsupported fork");

        (uint256 cost, ) = wormhole().quoteEVMDeliveryPrice(recipientChain, 0, 300000);
        return cost;
    }

    function mint(address recipient, uint256 amount) public onlyOwner {
        require(mintedSupply() + amount <= maxSupply(), "MAX SUPPLY REACHED");
        setMintedSupply(mintedSupply() + amount);
        _mint(recipient, amount);
    }
}
