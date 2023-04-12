// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {
    uint256 public counter = 0;

    function _baseURI() internal view virtual override returns (string memory) {
        return "LegacyBASEURI/";
    }

    constructor() ERC721("testNFT", "testNFT") {
        _mint(msg.sender, counter);
        counter++;
    }

    function mint() public {
        _mint(msg.sender, counter);
        counter++;
    }
}
