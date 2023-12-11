# CAT ERC Standard
Cross Chain Burn and Mint for ERC721 and ERC20 tokens

This is a reference implementation to demonstrate the concept of burn-and-mint token transfer using Wormhole as Generic messaging protocol.

## Getting Started

 

These instructions will guide you on how to get the project up and running on your local machine.

 

### Installation

 

1. Clone the repo

 

2. Install npm packages

 `npm install`

 

3. Enter your wallet private key in the .env file

 `PRIVATE_KEY=[YOUR_PRIVATE_KEY]`

 

### Deploy

1. Go to the deployERC20.ts file and set the name and symbol of your CAT token. You can also set a token supply of your choice.



2. Run the following command to deploy your CATERC20 token on any two networks of your choice. Make sure the networks are supported by wormhole's automatic relayer. You can get the name of the networks from hardhat.config.js. ALso make sure that you have sufficient gas available on respective network.

 `npm run deploy-ERC20 [NAME_OF_NETWORK]`



3. Run the following command on both of your chosen networks to register the deployed CATERC20 tokens on each network.

 `npm run register-ERC20 [NAME_OF_NETWORK]`




### Bridge

1. Go to the runBridgeOut.ts file and make the following changes:

 `const ownerAddress = "[YOUR_OWN_ADDRESS]";`

 `const recipient = "[YOUR_OWN_ADDRESS_ON_DEST_CHAIN]";`

 `const destinationChain = "[DESTINATION_WORMHOLE_CHAIN_ID]"`

 

2. Run the following command on any one network to transfer your CATERC20 tokens to the other network.

 `npm run bridgeOut [NAME_OF_NETWORK]`

