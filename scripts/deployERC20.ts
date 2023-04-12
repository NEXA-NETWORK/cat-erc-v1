import {ethers} from "hardhat";
import wormhole from "@certusone/wormhole-sdk";
import hre from "hardhat";
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const name = "";
const symbol = "";
const decimals = 18;
const maxSupply = 100;
const wormholeChainId = "";
const wormholeCoreContract = "";

async function deploy() {
  const CATERC20 = await ethers.getContractFactory("CATERC20");

  const catERC20 = await CATERC20.deploy(name, symbol, decimals, maxSupply);
  await catERC20.deployed();

  const initialize = await catERC20.initialize(
        wormholeChainId,
        wormholeCoreContract,
        1
  );
  
  try {
    await hre.run("verify:verify", {
      address: catERC20.address,
      contract: "contracts/ERC20/CATERC20.sol:CATERC20",
      constructorArguments: [name, symbol, decimals, maxSupply],
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
      contractName: "CATERC20",
      chainId: hre.network.config.chainId,
      wormholeChainId: wormholeChainId,
      chainName: hre.network.name,
      deployedBridge: catERC20.address,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
