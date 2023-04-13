import { ethers } from "hardhat";
import wormhole, { sign } from "@certusone/wormhole-sdk";
import hre from "hardhat";
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

let nowTime = new Date().getTime() / 1000;
nowTime = Math.floor(parseInt(nowTime.toString()));


const ERC721Contract = "";
const signature = "";
let custodianAddress: string = ""
let wormholeChains: string[] = [];
let addresses: string[] = [];
let validTillSeconds = 300


let validTime = nowTime + validTillSeconds;
let signatureArguments = {
  custodian: custodianAddress,
  validTill: validTime,
  signature: signature,
};

async function register() {
  const CATERC721 = await ethers.getContractAt("CATERC721ParentChain", ERC721Contract);
  const addressesBytes32: string[] = [];

  for (let i = 0; i < wormholeChains.length; i++) {
    addressesBytes32.push(
      await CATERC721.addressToBytes(addresses[i])
    );
  }
  const registerChains = await CATERC721.registerChains(wormholeChains, addressesBytes32, signatureArguments);
  registerChains.wait();
}

register();
