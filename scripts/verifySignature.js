const ethers = require("ethers");
const PRIVATE_KEY = "<YOUR_PRIVATE_KEY_HERE>";

const signMessage = async (custodian, validTill) => {
  try {
    const signer = new ethers.Wallet(PRIVATE_KEY);

    let messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [custodian, validTill]
    );

    let messageHashBinary = ethers.utils.arrayify(messageHash);
    let signature = await signer.signMessage(messageHashBinary);

    console.log({
      custodian: custodian,
      validTill: validTill,
      signature: signature,
    });
  } catch (err) {
    console.log(err);
    throw err.message;
  }
};

signMessage("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", 1712129727);
