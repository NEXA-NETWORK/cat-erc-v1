import { ethers } from "hardhat";
import path from "path";
import hre from "hardhat";
import fs from "fs";
const catDeploymentsPaths = path.join(__dirname, "../catDeployments.json");
const bytesPadding = "0x000000000000000000000000";

const ownerAddress = "";
const recipientAddress = ""
const destTokenAddress = ""
const mintAmount = ethers.utils.parseUnits("100000", 18);
const amount = ethers.utils.parseUnits("100", 18);
const destinationChain = "";
const recipient = bytesPadding + recipientAddress.substring(2);
const destToken = bytesPadding + destTokenAddress.substring(2);
const valueInEther = hre.ethers.utils.parseEther('0.001');
const gasLimit = '6000000';

async function bridgeOut() {
  const CAT = await ethers.getContractAt("CATERC20", "");

  const mint = await CAT.mint(ownerAddress, mintAmount);
  await mint.wait();

  const bridgeOut = await CAT.bridgeOut(amount, destinationChain, recipient, destToken, { value: valueInEther, gasLimit: gasLimit });
  await bridgeOut.wait();
  console.log(bridgeOut);

}

bridgeOut();
