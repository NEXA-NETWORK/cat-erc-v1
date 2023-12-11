import {ethers} from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { wormholeConfig } from "../config/wormholeConfig";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const name = "";
const symbol = "";
const decimals = 18;
const maxSupply = ethers.utils.parseUnits("1000000", 18);

let wormholeChainId = "";
let wormholeCoreContract = "";

if(wormholeConfig.length > 0) {
  for (const elem of wormholeConfig) {
    if (hre.network.config.chainId?.toString() === elem.evmChainId) {
      wormholeChainId = elem.wormholeChainId;
      wormholeCoreContract = elem.wormholeRelayerAddress;
    }
  }
}

console.log("Wormhole Chain Id:", wormholeChainId);
console.log("Wormhole Relayer Contract:", wormholeCoreContract);

async function deploy() {
  const CATERC20 = await ethers.getContractFactory("CATERC20");

  const catERC20 = await CATERC20.deploy(name, symbol, decimals);
  await catERC20.deployed();

  const initialize = await catERC20.initialize(
    wormholeChainId,
    wormholeCoreContract,
    maxSupply
  );
  
  try {
    await hre.run("verify:verify", {
      address: catERC20.address,
      contract: "contracts/ERC20/CATERC20.sol:CATERC20",
      constructorArguments: [name, symbol, decimals],
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
      evmChainId: hre.network.config.chainId,
      wormholeChainId: wormholeChainId,
      chainName: hre.network.name,
      deployedContract: catERC20.address,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
