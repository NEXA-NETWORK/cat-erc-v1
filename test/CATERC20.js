const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

const name = "CATERC20Test";
const symbol = "CATTEST";
const decimals = 18;
const maxSupply = "1000000000000000000000";

const wormholeChainId = "1";
const wormholeCoreContract = "0x9BF4eb2fd0E414B813E5253811055238E8923A48";
const finality = 1;
const nowTime = parseInt(Math.floor(new Date().getTime() / 1000));
const validTime = nowTime + 300;

describe("CATERC20", () => {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    const CATERC20Factory = await ethers.getContractFactory("CATERC20");
    const TestTokenInstance = await TestTokenFactory.deploy();
    await TestTokenInstance.deployed();
    const CATERC20Instance = await CATERC20Factory.deploy(name, symbol, decimals, maxSupply);
    await CATERC20Instance.deployed();

    const initialize = await CATERC20Instance.connect(owner).initialize(
      wormholeChainId,
      wormholeCoreContract,
      finality
    );
    await initialize.wait();

    return {
      owner,
      otherAccount,
      TestTokenInstance,
      CATERC20Instance,
    };
  }

  async function makeSignature(custodian, validTill, signer) {
    let messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [custodian, validTill]
    );

    let messageHashBinary = ethers.utils.arrayify(messageHash);
    let signature = await signer.signMessage(messageHashBinary);

    return { custodian, validTill, signature };
  }

  describe("Governance Functions", () => {
    it("registerChain", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20Instance } = await deployFixture();
      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];

      const TestTokenBytes32 = await CATERC20Instance.connect(otherAccount).addressToBytes(
        TestTokenInstance.address
      );
      await CATERC20Instance.connect(otherAccount).registerChain(
        2,
        TestTokenBytes32,
        SignatureVerification
      );

      expect(await CATERC20Instance.tokenContracts(2)).to.equal(TestTokenBytes32);
    });

    it("register multiple chains", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20Instance } = await deployFixture();
      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];
      const chaindIds = [1, 2, 3];
      const tokenAddresses = [
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000003",
      ];
      const tokenAddressesBytes32 = [];

      for (let i = 0; i < chaindIds.length; i++) {
        tokenAddressesBytes32.push(
          await CATERC20Instance.connect(otherAccount).addressToBytes(tokenAddresses[i])
        );
      }

      await CATERC20Instance.connect(otherAccount).registerChains(
        chaindIds,
        tokenAddressesBytes32,
        SignatureVerification
      );

      expect(await CATERC20Instance.tokenContracts(chaindIds[0])).to.equal(
        tokenAddressesBytes32[0]
      );
      expect(await CATERC20Instance.tokenContracts(chaindIds[1])).to.equal(
        tokenAddressesBytes32[1]
      );
      expect(await CATERC20Instance.tokenContracts(chaindIds[2])).to.equal(
        tokenAddressesBytes32[2]
      );
    });

    it("update finality", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20Instance } = await deployFixture();
      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];
      const newFinality = 15;

      await CATERC20Instance.connect(otherAccount).updateFinality(
        newFinality,
        SignatureVerification
      );

      expect(await CATERC20Instance.finality()).to.equal(newFinality);
    });
  });

  describe("Encoding and Decoding Transfers", () => {
    it("encode and decode data to transfer", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20Instance } = await deployFixture();

      const data = {
        amount: 100,
        tokenAddress: await CATERC20Instance.addressToBytes(TestTokenInstance.address),
        tokenChain: 1,
        toAddress: await CATERC20Instance.addressToBytes(otherAccount.address),
        toChain: 2,
      };

      const encoded = await CATERC20Instance.encodeTransfer(data);
      const decoded = await CATERC20Instance.decodeTransfer(encoded);

      expect(decoded.amount).to.equal(data.amount);
      expect(decoded.tokenAddress).to.equal(data.tokenAddress);
      expect(decoded.tokenChain).to.equal(data.tokenChain);
      expect(decoded.toAddress).to.equal(data.toAddress);
      expect(decoded.toChain).to.equal(data.toChain);
    });
  });

  describe("Minting New Tokens", () => {
    it("Should Mint new tokens only by owner", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20Instance } = await deployFixture();
      const amountToMint = "1000000000"

      await CATERC20Instance.connect(owner).mint(owner.address, amountToMint);
      expect (await CATERC20Instance.connect(owner).balanceOf(owner.address)).to.equal(amountToMint);

      await expect(CATERC20Instance.connect(otherAccount).mint(otherAccount.address,amountToMint)).to.be.reverted
    });
  });
});
