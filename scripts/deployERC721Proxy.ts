import {ethers} from "hardhat";
import wormhole from "@certusone/wormhole-sdk";
import hre from "hardhat";
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const wormholeChainId = "";
const wormholeCoreContract = "";

async function deploy() {
  const TestNFT = await ethers.getContractFactory("TestNFT");
  const CATERC721Proxy = await ethers.getContractFactory("CATERC721Proxy");

  const testNFT = await TestNFT.deploy();
  await testNFT.deployed();

  const catERC721Proxy = await CATERC721Proxy.deploy();
  await catERC721Proxy.deployed();

  const initialize = await catERC721Proxy.initialize(
        wormholeChainId,
        testNFT.address,
        wormholeCoreContract,
        1
  );
  
  try {
    await hre.run("verify:verify", {
      address: catERC721Proxy.address,
      contract: "contracts/ERC721/CATERC721Proxy.sol:CATERC721Proxy",
      constructorArguments: [],
    });

    console.log("Verified Successfully");
  } catch (error) {
    console.log("Verification Failed: ", error);
  }

  try {
    await hre.run("verify:verify", {
      address: testNFT.address,
      contract: "contracts/testing/ERC721Sample.sol:TestNFT",
      constructorArguments: [],
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
      contractName: "CATERC721Proxy",
      chainId: hre.network.config.chainId,
      wormholeChainId: wormholeChainId,
      chainName: hre.network.name,
      deployedBridge: catERC721Proxy.address,
      deployedNft: testNFT.address,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
