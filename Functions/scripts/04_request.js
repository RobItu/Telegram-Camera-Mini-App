const { Contract, ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { Location } = require("@chainlink/functions-toolkit");
require("@chainlink/env-enc").config();
// require('dotenv').config()

const { signer } = require("../connection.js");
const { abi } = require("../contracts/abi/FunctionsConsumer.json");

const gasOptions = {
  gasLimit: ethers.utils.hexlify(300000), // Reduce gas limit
  maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"), // Lower fees
  maxFeePerGas: ethers.utils.parseUnits("60", "gwei"), // Lower max fee
};

const consumerAddress = "0xcB310d201C1b73a7bfBbdBF648f3ac4441a133C2";
const subscriptionId = "317";
const encryptedSecretsRef = "0xa266736c6f744964006776657273696f6e1a67610c0f";

const sendRequest = async () => {
  if (!consumerAddress || !encryptedSecretsRef || !subscriptionId) {
    throw Error("Missing required environment variables.");
  }
  const functionsConsumer = new Contract(consumerAddress, abi, signer);

  const source = fs
    .readFileSync(path.resolve(__dirname, "../source.js"))
    .toString();

  const prompt = "Describe what a blockchain is in 15 words or less";
  const args = [prompt];
  const callbackGasLimit = 300_000;

  console.log("\n Sending the Request....");
  const requestTx = await functionsConsumer.sendRequest(
    source,
    Location.DONHosted,
    encryptedSecretsRef,
    args,
    [], // bytesArgs can be empty
    subscriptionId,
    callbackGasLimit,
    gasOptions
  );

  const txReceipt = await requestTx.wait(1);
  const requestId = txReceipt.events[2].args.id;
  console.log(
    `\nRequest made.  Request Id is ${requestId}. TxHash is ${requestTx.hash}`
  );
};

sendRequest().catch((err) => {
  console.log("\nError making the Functions Request : ", err);
});
