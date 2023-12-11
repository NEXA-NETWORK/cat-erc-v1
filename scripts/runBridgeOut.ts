import { ethers } from "hardhat";
import hre from "hardhat";
import path from 'path';
import fs from 'fs';
const deploymentsPath = path.join(__dirname, "../deployments.json");

const bytesPadding = "0x000000000000000000000000";

const ownerAddress = "";
const recipientAddress = "";
const mintAmount = ethers.utils.parseUnits("100000", 18);
const amount = ethers.utils.parseUnits("100", 18);
const destinationChain = "";
const recipient = bytesPadding + recipientAddress.substring(2);
const gasLimit = "6000000";

async function bridgeOut() {
  const file = fs.existsSync(deploymentsPath)
  ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
  : [];

  let ERC20Contract = "";
  let destTokenAddress = "";

  for (const elem of file) {
    if(hre.network.config.chainId === elem.evmChainId) {
      ERC20Contract = elem.deployedContract;
    }
    if(destinationChain === elem.wormholeChainId) {
      destTokenAddress = elem.deployedContract;
    }
  }
  const destToken = bytesPadding + destTokenAddress.substring(2);

  const CAT = await ethers.getContractAt("CATERC20", ERC20Contract);

  const mint = await CAT.mint(ownerAddress, mintAmount);
  await mint.wait();

  const wormholeBridgeFee = await CAT.wormholeEstimatedFee(destinationChain);
  console.log("Wormhole Bridge Fees: ", wormholeBridgeFee);

  const bridgeOut = await CAT.bridgeOut(amount, destinationChain, recipient, destToken, { value: wormholeBridgeFee, gasLimit: gasLimit });
  await bridgeOut.wait();
  console.log(bridgeOut);

}

bridgeOut();
