const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const finality = 1;

async function deploy() {
  const CATERC721 = await ethers.getContractFactory("CATERC721");

  console.log("Deploying CATERC721 Contract...");

  const catERC721 = await upgrades.deployProxy(
    CATERC721,
    [finality],
    {
      initializer: "initialize",
    }
  );
  await catERC721.deployed();
  console.log("waiting for block confirmations");
  await catERC721.deployTransaction.wait(1);

  let implementationAddress = await upgrades.erc1967.getImplementationAddress(
    catERC721.address
  );

  console.log("CATERC721 Proxy deployed to:", catERC721.address);
  console.log(
    "CATERC721 Implementation deployed to:",
    implementationAddress
  );

  try {
    await hre.run("verify:verify", {
      address: implementationAddress,
      contract: "contracts/ERC721/CATERC721.sol:CATERC721",
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
      contractName: "CATERC721",
      chainId: hre.network.config.chainId,
      chainName: hre.network.name,
      deployedProxyAddress: catERC721.address,
      deployedImplementationAddress: implementationAddress,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
