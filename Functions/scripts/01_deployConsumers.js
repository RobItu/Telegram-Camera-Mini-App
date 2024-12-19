const { abi, bytecode } = require("../contracts/abi/FunctionsConsumer.json");
const { wallet, signer } = require("../connection.js");
const { networks } = require("../networks.js");
const { ContractFactory, utils } = require("ethers");

const GAS_LIMIT = 500000; // Adjust based on the contract's complexity
const MAX_FEE_PER_GAS = utils.parseUnits("30", "gwei"); // Adjust based on network gas prices
const MAX_PRIORITY_FEE_PER_GAS = utils.parseUnits("25", "gwei"); // Priority fee for miners

const NETWORK = "polygonAmoy";

const routerAddress = networks[NETWORK].functionsRouter;
const donIdBytes32 = utils.formatBytes32String(networks[NETWORK].donId);

const deployFunctionsConsumerContract = async () => {
  const contractFactory = new ContractFactory(abi, bytecode, wallet);

  console.log(
    `\nDeploying FunctionsConsumer contract on network ${NETWORK}...`
  );
  const functionsConsumerContract = await contractFactory
    .connect(signer)
    .deploy(routerAddress, donIdBytes32);

  await functionsConsumerContract.deployed();
  console.log(`\nDeployed at address ${functionsConsumerContract.address}`);
};

deployFunctionsConsumerContract().catch((err) => {
  console.log("Error deploying the Consumer Contract ", err);
});
