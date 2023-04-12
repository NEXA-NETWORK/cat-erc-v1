const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

const wormholeChainId = "1";
const wormholeCoreContract = "0x9BF4eb2fd0E414B813E5253811055238E8923A48";
const finality = 1;
const nowTime = parseInt(Math.floor(new Date().getTime() / 1000));
const validTime = nowTime + 300;

describe("CATERC20ParentChain", () => {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    const CATERC20ParentChainFactory = await ethers.getContractFactory("CATERC20ParentChain");
    const TestTokenInstance = await TestTokenFactory.deploy();
    await TestTokenInstance.deployed();
    const CATERC20ParentChainInstance = await CATERC20ParentChainFactory.deploy();
    await CATERC20ParentChainInstance.deployed();

    const initialize = await CATERC20ParentChainInstance.connect(owner).initialize(
      wormholeChainId,
      TestTokenInstance.address,
      wormholeCoreContract,
      finality
    );
    await initialize.wait();

    return {
      owner,
      otherAccount,
      TestTokenInstance,
      CATERC20ParentChainInstance,
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
      const { owner, otherAccount, TestTokenInstance, CATERC20ParentChainInstance } =
        await deployFixture();
      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];

      const TestTokenBytes32 = await CATERC20ParentChainInstance.connect(
        otherAccount
      ).addressToBytes(TestTokenInstance.address);
      await CATERC20ParentChainInstance.connect(otherAccount).registerChain(
        2,
        TestTokenBytes32,
        SignatureVerification
      );

      expect(await CATERC20ParentChainInstance.tokenContracts(2)).to.equal(TestTokenBytes32);
    });

    it("register multiple chains", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20ParentChainInstance } =
        await deployFixture();
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
          await CATERC20ParentChainInstance.connect(otherAccount).addressToBytes(tokenAddresses[i])
        );
      }

      await CATERC20ParentChainInstance.connect(otherAccount).registerChains(
        chaindIds,
        tokenAddressesBytes32,
        SignatureVerification
      );

      expect(await CATERC20ParentChainInstance.tokenContracts(chaindIds[0])).to.equal(
        tokenAddressesBytes32[0]
      );
      expect(await CATERC20ParentChainInstance.tokenContracts(chaindIds[1])).to.equal(
        tokenAddressesBytes32[1]
      );
      expect(await CATERC20ParentChainInstance.tokenContracts(chaindIds[2])).to.equal(
        tokenAddressesBytes32[2]
      );
    });

    it("update finality", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20ParentChainInstance } =
        await deployFixture();
      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];
      const newFinality = 15;

      await CATERC20ParentChainInstance.connect(otherAccount).updateFinality(
        newFinality,
        SignatureVerification
      );

      expect(await CATERC20ParentChainInstance.finality()).to.equal(newFinality);
    });
  });

  describe("Encoding and Decoding Transfers", () => {
    it("encode and decode data to transfer", async () => {
      const { owner, otherAccount, TestTokenInstance, CATERC20ParentChainInstance } =
        await deployFixture();

      const data = {
        amount: 100,
        tokenAddress: await CATERC20ParentChainInstance.addressToBytes(TestTokenInstance.address),
        tokenChain: 1,
        toAddress: await CATERC20ParentChainInstance.addressToBytes(otherAccount.address),
        toChain: 2,
      };

      const encoded = await CATERC20ParentChainInstance.encodeTransfer(data);
      const decoded = await CATERC20ParentChainInstance.decodeTransfer(encoded);

      expect(decoded.amount).to.equal(data.amount)
      expect(decoded.tokenAddress).to.equal(data.tokenAddress)
      expect(decoded.tokenChain).to.equal(data.tokenChain)
      expect(decoded.toAddress).to.equal(data.toAddress)
      expect(decoded.toChain).to.equal(data.toChain)

    });
  });
});
