const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const elliptic = require("elliptic");
const { ZERO_BYTES32, ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const testSigner1PK = "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0";

const name = "CATERC721Test";
const symbol = "CATTEST";
const maxSupply = 100;
const baseUri = "https://boredapeyachtclub.com/api/mutants/";

const wormholeChainId = "2";
const wormholeCoreContract = "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B";
const finality = 1;
const nowTime = parseInt(Math.floor(new Date().getTime() / 1000));
const validTime = nowTime + 300;

describe("CATERC721", () => {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TestNFTFactory = await ethers.getContractFactory("TestNFT");
    const CATERC721Factory = await ethers.getContractFactory("CATERC721");
    const TestNFTInstance = await TestNFTFactory.deploy();
    await TestNFTInstance.deployed();
    const CATERC721Instance = await CATERC721Factory.deploy(name, symbol);
    await CATERC721Instance.deployed();

    const initialize = await CATERC721Instance.connect(owner).initialize(
      wormholeChainId,
      wormholeCoreContract,
      finality,
      maxSupply,
      baseUri
    );
    await initialize.wait();

    return {
      owner,
      otherAccount,
      TestNFTInstance,
      CATERC721Instance,
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
      const { owner, otherAccount, TestNFTInstance, CATERC721Instance } = await loadFixture(deployFixture);
      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];

      const TestNFTBytes32 = await CATERC721Instance.connect(otherAccount).addressToBytes(
        TestNFTInstance.address
      );
      await CATERC721Instance.connect(otherAccount).registerChain(
        2,
        TestNFTBytes32,
        SignatureVerification
      );

      expect(await CATERC721Instance.tokenContracts(2)).to.equal(TestNFTBytes32);
    });

    it("register multiple chains", async () => {
      const { owner, otherAccount, TestNFTInstance, CATERC721Instance } = await loadFixture(deployFixture);
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
          await CATERC721Instance.connect(otherAccount).addressToBytes(tokenAddresses[i])
        );
      }

      await CATERC721Instance.connect(otherAccount).registerChains(
        chaindIds,
        tokenAddressesBytes32,
        SignatureVerification
      );

      expect(await CATERC721Instance.tokenContracts(chaindIds[0])).to.equal(
        tokenAddressesBytes32[0]
      );
      expect(await CATERC721Instance.tokenContracts(chaindIds[1])).to.equal(
        tokenAddressesBytes32[1]
      );
      expect(await CATERC721Instance.tokenContracts(chaindIds[2])).to.equal(
        tokenAddressesBytes32[2]
      );
    });

    it("update finality", async () => {
      const { owner, otherAccount, TestNFTInstance, CATERC721Instance } = await loadFixture(deployFixture);
      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];
      const newFinality = 15;

      await CATERC721Instance.connect(otherAccount).updateFinality(
        newFinality,
        SignatureVerification
      );

      expect( await CATERC721Instance.finality()).to.equal(newFinality);

      await expect(CATERC721Instance.connect(otherAccount).updateFinality(
        newFinality,
        SignatureVerification
      )).to.be.reverted;

    });
  });

  describe("Encoding and Decoding Transfers", () => {
    it("encode and decode data to transfer", async () => {
      const { owner, otherAccount, TestNFTInstance, CATERC721Instance } = await loadFixture(deployFixture);

      const data = {
        tokenAddress: await CATERC721Instance.addressToBytes(TestNFTInstance.address),
        tokenChain: 1,
        tokenID: 1,
        uri: "hello",
        toAddress: await CATERC721Instance.addressToBytes(otherAccount.address),
        toChain: 2,
      };

      const encoded = await CATERC721Instance.encodeTransfer(data);
      const decoded = await CATERC721Instance.decodeTransfer(encoded);

      expect(decoded.tokenAddress).to.equal(data.tokenAddress);
      expect(decoded.tokenChain).to.equal(data.tokenChain);
      expect(decoded.tokenID).to.equal(data.tokenID);
      expect(decoded.uri).to.equal(data.uri);
      expect(decoded.toAddress).to.equal(data.toAddress);
      expect(decoded.toChain).to.equal(data.toChain);
    });
  });

  describe("Cross Chain Transfers", () => {
    it("bridgeOut", async () => {
      const { owner, otherAccount, TestNFTInstance, CATERC721Instance } = await loadFixture(deployFixture);

      const { custodian, validTill, signature } = await makeSignature(
        otherAccount.address,
        validTime,
        owner
      );
      const SignatureVerification = [custodian, validTill, signature];

      const TestNFTBytes32 = await CATERC721Instance.connect(otherAccount).addressToBytes(
        TestNFTInstance.address
      );
      await CATERC721Instance.connect(otherAccount).registerChain(
        2,
        TestNFTBytes32,
        SignatureVerification
      );

      await CATERC721Instance.mint(owner.address);
      await CATERC721Instance.bridgeOut(
        0,
        wormholeChainId,
        await CATERC721Instance.addressToBytes(owner.address),
        0
      );
      await CATERC721Instance.mint(owner.address);
      expect( await CATERC721Instance.ownerOf(1)).to.be.equal(owner.address);
      await expect(CATERC721Instance.ownerOf(0)).to.be.reverted;
      expect ( await CATERC721Instance.mintedSupply()).to.be.equal(2);
    });

    it("bridgeIn", async () => {
      const { owner, otherAccount, TestNFTInstance, CATERC721Instance } = await loadFixture(deployFixture);
      const uri = "hello";

      const data = {
        tokenAddress: await CATERC721Instance.addressToBytes(CATERC721Instance.address),
        tokenChain: 2,
        tokenID: 0,
        uri: uri,
        toAddress: await CATERC721Instance.addressToBytes(owner.address),
        toChain: 2,
      };

      const payload = await CATERC721Instance.encodeTransfer(data);
      const vaa = await signAndEncodeVM(
        1,
        1,
        wormholeChainId,
        await CATERC721Instance.addressToBytes(CATERC721Instance.address),
        0,
        payload,
        [testSigner1PK],
        0,
        finality
      );
      console.log("VAA: ", vaa);

      await CATERC721Instance.bridgeIn("0x" + vaa);
    });
  });
});

const signAndEncodeVM = async function (
  timestamp,
  nonce,
  emitterChainId,
  emitterAddress,
  sequence,
  data,
  signers,
  guardianSetIndex,
  consistencyLevel
) {
  const body = [
    web3.eth.abi.encodeParameter("uint32", timestamp).substring(2 + (64 - 8)),
    web3.eth.abi.encodeParameter("uint32", nonce).substring(2 + (64 - 8)),
    web3.eth.abi.encodeParameter("uint16", emitterChainId).substring(2 + (64 - 4)),
    web3.eth.abi.encodeParameter("bytes32", emitterAddress).substring(2),
    web3.eth.abi.encodeParameter("uint64", sequence).substring(2 + (64 - 16)),
    web3.eth.abi.encodeParameter("uint8", consistencyLevel).substring(2 + (64 - 2)),
    data.substr(2),
  ];

  const hash = web3.utils.soliditySha3(web3.utils.soliditySha3("0x" + body.join("")));

  let signatures = "";

  for (let i in signers) {
    const ec = new elliptic.ec("secp256k1");
    const key = ec.keyFromPrivate(signers[i]);
    const signature = key.sign(hash.substr(2), { canonical: true });

    const packSig = [
      web3.eth.abi.encodeParameter("uint8", i).substring(2 + (64 - 2)),
      zeroPadBytes(signature.r.toString(16), 32),
      zeroPadBytes(signature.s.toString(16), 32),
      web3.eth.abi.encodeParameter("uint8", signature.recoveryParam).substr(2 + (64 - 2)),
    ];

    signatures += packSig.join("");
  }

  const vm = [
    web3.eth.abi.encodeParameter("uint8", 1).substring(2 + (64 - 2)),
    web3.eth.abi.encodeParameter("uint32", guardianSetIndex).substring(2 + (64 - 8)),
    web3.eth.abi.encodeParameter("uint8", signers.length).substring(2 + (64 - 2)),

    signatures,
    body.join(""),
  ].join("");

  return vm;
};

function zeroPadBytes(value, length) {
  while (value.length < 2 * length) {
    value = "0" + value;
  }
  return value;
}
