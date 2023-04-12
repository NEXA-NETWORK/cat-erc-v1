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
  const CATERC721ParentChain = await ethers.getContractFactory("CATERC721ParentChain");

  const testNFT = await TestNFT.deploy();
  await testNFT.deployed();

  const catERC721ParentChain = await CATERC721ParentChain.deploy();
  await catERC721ParentChain.deployed();

  const initialize = await catERC721ParentChain.initialize(
        wormholeChainId,
        testNFT.address,
        wormholeCoreContract,
        1
  );
  
  try {
    await hre.run("verify:verify", {
      address: catERC721ParentChain.address,
      contract: "contracts/ERC721/CATERC721ParentChain.sol:CATERC721ParentChain",
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
      contractName: "CATERC721ParentChain",
      chainId: hre.network.config.chainId,
      wormholeChainId: wormholeChainId,
      chainName: hre.network.name,
      deployedBridge: catERC721ParentChain.address,
      deployedNft: testNFT.address,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
