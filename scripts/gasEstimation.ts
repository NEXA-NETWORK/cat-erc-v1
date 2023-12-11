import { ethers } from "hardhat";
import hre from "hardhat";
import path from 'path';
import fs from 'fs';
const deploymentsPath = path.join(__dirname, "../deployments.json");

const destinationChain = "";

async function getGasEstimation() {
  const file = fs.existsSync(deploymentsPath)
    ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
    : [];

  let ERC20Contract = "";

  for (const elem of file) {
    if (hre.network.config.chainId === elem.chainId) {
      ERC20Contract = elem.deployedContract;
    }
  }

  const CAT = await ethers.getContractAt("CATERC20", ERC20Contract);

  const gasEstimates = await CAT.wormholeEstimatedFee(destinationChain);
  console.log(gasEstimates);
}

getGasEstimation();
