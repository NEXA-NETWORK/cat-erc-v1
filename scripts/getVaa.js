const wormhole = require("@certusone/wormhole-sdk");
const ethers = require("ethers");
const {
  NodeHttpTransport,
} = require("@improbable-eng/grpc-web-node-http-transport");

async function getVAA(
  rpc,
  hash,
  bridge,
  emitterContract,
  WORMHOLE_RPC_HOST,
  WORMHOLE_CHAIN_ID
) {
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const tx = await provider.getTransactionReceipt(hash);
  const sequence = wormhole.parseSequenceFromLogEth(tx, bridge);
  const emitterAddress = wormhole.getEmitterAddressEth(emitterContract);

  let signedVAA;
  let attempts = 0;
  let retryAttempts = 50;
  while (!signedVAA) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      signedVAA = await wormhole.getSignedVAA(
        WORMHOLE_RPC_HOST,
        WORMHOLE_CHAIN_ID,
        emitterAddress,
        sequence,
        {
          transport: NodeHttpTransport(),
        }
      );
    } catch (e) {
      if (retryAttempts !== undefined && attempts > retryAttempts) {
        throw e;
      }
    }
  }

  const vaaBytes = `0x${wormhole.uint8ArrayToHex(signedVAA.vaaBytes)}`;
  console.log(vaaBytes);
  return vaaBytes;
}

//////////////////////// Testing Data for Testnet VAA's /////////////////////////////

// getVAA(
//   "https://data-seed-prebsc-1-s1.binance.org:8545/",
//   "0x0abfa04dbd6803aad6ac40066e83928122505724bcb9ceed7d0805fac262d21b",
//   "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
//   "0xE09767B554803D59101a4FE9753d18E75Fb5cc62",
//   "https://wormhole-v2-testnet-api.certus.one",
//   4
// );
