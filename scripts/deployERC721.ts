const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
import fs from "fs";
import path from "path";
const deploymentsPath = path.join(__dirname, "../deployments.json");

const finality = 1;

async function deploy() {
  const XBurnMintERC721 = await ethers.getContractFactory("XBurnMintERC721");

  console.log("Deploying XBurnMintERC721 Contract...");

  const xBurnMintERC721 = await upgrades.deployProxy(
    XBurnMintERC721,
    [finality],
    {
      initializer: "initialize",
    }
  );
  await xBurnMintERC721.deployed();
  console.log("waiting for block confirmations");
  await xBurnMintERC721.deployTransaction.wait(1);

  let implementationAddress = await upgrades.erc1967.getImplementationAddress(
    xBurnMintERC721.address
  );

  console.log("XBurnMintERC721 Proxy deployed to:", xBurnMintERC721.address);
  console.log(
    "XBurnMintERC721 Implementation deployed to:",
    implementationAddress
  );

  try {
    await hre.run("verify:verify", {
      address: implementationAddress,
      contract: "contracts/ERC721/XBurn&MintERC721.sol:XBurnMintERC721",
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
      contractName: "XBurnMintERC721",
      chainId: hre.network.config.chainId,
      chainName: hre.network.name,
      deployedProxyAddress: xBurnMintERC721.address,
      deployedImplementationAddress: implementationAddress,
    };

    file.push(contents);
    fs.writeFileSync(deploymentsPath, JSON.stringify(file, null, 2), "utf8");
  } catch (error) {}
}

deploy();
