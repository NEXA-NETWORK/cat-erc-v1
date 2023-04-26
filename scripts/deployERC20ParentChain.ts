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
  const CATERC20Proxy = await ethers.getContractFactory("CATERC20Proxy");

  const testToken = await TestToken.deploy();
  await testToken.deployed();

  const catERC20Proxy = await CATERC20Proxy.deploy();
  await catERC20Proxy.deployed();

  const initialize = await catERC20Proxy.initialize(
        wormholeChainId,
        testToken.address,
        wormholeCoreContract,
        1
  );
  
  try {
    await hre.run("verify:verify", {
      address: catERC20Proxy.address,
      contract: "contracts/ERC20/CATERC20Proxy.sol:CATERC20Proxy",
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
      contractName: "CATERC20Proxy",
      chainId: hre.network.config.chainId,
      wormholeChainId: wormholeChainId,
      chainName: hre.network.name,
      deployedBridge: catERC20Proxy.address,
      deployedToken: testToken.address,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
