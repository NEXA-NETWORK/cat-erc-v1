import {ethers} from "hardhat";
import wormhole from "@certusone/wormhole-sdk";
import hre from "hardhat";
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const wormholeChainId = "";
const wormholeCoreContract = "";

async function deploy() {
  const TestToken = await ethers.getContractFactory("TestToken");
  const CATERC20ParentChain = await ethers.getContractFactory("CATERC20ParentChain");

  const testToken = await TestToken.deploy();
  await testToken.deployed();

  const catERC20ParentChain = await CATERC20ParentChain.deploy();
  await catERC20ParentChain.deployed();

  const initialize = await catERC20ParentChain.initialize(
        wormholeChainId,
        testToken.address,
        wormholeCoreContract,
        1
  );
  
  try {
    await hre.run("verify:verify", {
      address: catERC20ParentChain.address,
      contract: "contracts/ERC20/CATERC20ParentChain.sol:CATERC20ParentChain",
      constructorArguments: [],
    });

    console.log("Verified Successfully");
  } catch (error) {
    console.log("Verification Failed: ", error);
  }

  try {
    await hre.run("verify:verify", {
      address: testToken.address,
      contract: "contracts/testing/ERC20Sample.sol:TestToken",
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
      contractName: "CATERC20ParentChain",
      chainId: hre.network.config.chainId,
      wormholeChainId: wormholeChainId,
      chainName: hre.network.name,
      deployedBridge: catERC20ParentChain.address,
      deployedToken: testToken.address,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
