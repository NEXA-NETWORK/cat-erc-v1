import {ethers} from "hardhat";
import wormhole from "@certusone/wormhole-sdk";
import hre from "hardhat";
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const name = "";
const symbol = "";
const maxSupply = "";
const base_uri = "";
const wormholeChainId = "";
const wormholeCoreContract = "";

async function deploy() {
  const CATERC721 = await ethers.getContractFactory("CATERC721");

  const catERC721 = await CATERC721.deploy(name, symbol);
  await catERC721.deployed();

  const initialize = await catERC721.initialize(
        wormholeChainId,
        wormholeCoreContract,
        1,
        maxSupply,
        base_uri
  );
  
  try {
    await hre.run("verify:verify", {
      address: catERC721.address,
      contract: "contracts/ERC721/CATERC721.sol:CATERC721",
      constructorArguments: [name, symbol],
    });

    console.log("Verified Successfully");
  } catch (error) {
    console.log("Verification Failed: ", error);
  }

  try {
    const file = fs.existsSync(deploymentsPath)
      ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
      : [];

    const contents = {
      contractName: "CATERC721",
      chainId: hre.network.config.chainId,
      wormholeChainId: wormholeChainId,
      chainName: hre.network.name,
      deployedBridge: catERC721.address,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
