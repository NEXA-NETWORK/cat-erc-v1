import { ethers } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { Wallet } from "ethers";
import 'dotenv/config'
const deploymentsPath = path.join(__dirname, "../deployments.json");

let nowTime = new Date().getTime() / 1000;
nowTime = Math.floor(parseInt(nowTime.toString()));

const file = fs.existsSync(deploymentsPath)
  ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
  : [];

let ERC20Contract = "";

for (const elem of file) {
  if (hre.network.config.chainId === elem.evmChainId) {
    ERC20Contract = elem.deployedContract;
  }
}

let wormholeChains: string[] = [];
let addresses: string[] = [];

if (file.length > 0) {
  for (const elem of file) {
    wormholeChains.push(elem.wormholeChainId);
    addresses.push(elem.deployedContract);
  }
}


const rpc = hre.network.name;
const provider = new ethers.providers.JsonRpcProvider(rpc);

const ownerWallet = new Wallet(process.env.PRIVATE_KEY!, provider);

let validTillSeconds = 300
let validTime = nowTime + validTillSeconds;
let custodianAddress: string = "";

let messageHash = ethers.utils.solidityKeccak256(
  ["address", "uint256"],
  [custodianAddress, validTime]
);

let messageHashBinary = ethers.utils.arrayify(messageHash);

async function register() {
  const CATERC20 = await ethers.getContractAt("CATERC20", ERC20Contract);
  const addressesBytes32: string[] = [];

  for (let i = 0; i < wormholeChains.length; i++) {
    addressesBytes32.push(
      await CATERC20.addressToBytes(addresses[i])
    );
  }

  const signature = await ownerWallet.signMessage(messageHashBinary);

  let signatureArguments = {
    custodian: custodianAddress,
    validTill: validTime,
    signature: signature,
  };

  const registerChains = await CATERC20.registerChains(wormholeChains, addressesBytes32, signatureArguments);
  registerChains.wait();
}

register();
