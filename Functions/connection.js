// require("@chainlink/env-enc").config();
require("dotenv").config({
  path: "/home/robitu/experiments/react-camera-test/Telegram-Camera-Mini-App/Functions/.env",
});
console.log(process.env);

const { providers, Wallet } = require("ethers");

const RPC_URL = process.env.SEPOLIA_RPC_URL;

if (!RPC_URL) {
  throw new Error("Please set the RPC_URL environment variable");
}

const provider = new providers.JsonRpcProvider(RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY || "UNSET");
const signer = wallet.connect(provider);

module.exports = { provider, wallet, signer };
