const { decodeResult, ReturnType } = require("@chainlink/functions-toolkit");
const { Contract } = require("ethers");

const { signer } = require("../connection.js");
const { abi } = require("../contracts/abi/FunctionsConsumer.json");

const consumerAddress = "0xcB310d201C1b73a7bfBbdBF648f3ac4441a133C2";
const readResponse = async () => {
  const functionsConsumer = new Contract(consumerAddress, abi, signer);

  const responseBytes = await functionsConsumer.s_lastResponse();
  console.log("\nResponse Bytes : ", responseBytes);

  const decodedResponse = decodeResult(responseBytes, ReturnType.string);

  console.log("\nDecoded response from OpenAI/ChatGPT:", decodedResponse);
};

readResponse().catch((err) => {
  console.log("Error reading response: ", err);
});
