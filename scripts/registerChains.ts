import { ethers } from "hardhat";
import wormhole from "@certusone/wormhole-sdk";
import hre from "hardhat";
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const ERC721Contract = "";
let chains: string[] = [];
let addresses: string[] = [];
let signatureArguments = {
  custodian: "custodian",
  validTill: "validTill",
  signature: "signature",
};

async function register() {
  const CATERC721 = await ethers.getContractAt("CATERC721", ERC721Contract);
  const registerChains = await CATERC721.registerChains(chains, addresses, signatureArguments);
}

register();
