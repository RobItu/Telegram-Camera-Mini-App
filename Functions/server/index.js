// This serverless API endpoint is hosted on Vercel and designed to interact with Chainlink Functions.
// When a POST request is received from Chainlink Functions, this endpoint will:
// 1. Echo back the received data in the response.
// 2. The echoed data is then captured by Chainlink and recorded on the blockchain.
// This setup is used to ensure that data processed through this endpoint is verifiably posted on the blockchain.

module.exports = (req, res) => {
  if (req.method === "POST") {
    // Echo back the JSON payload
    res.status(200).json(req.body);
  } else {
    // Only allow POST method
    res.status(405).send("Method Not Allowed");
  }
};
