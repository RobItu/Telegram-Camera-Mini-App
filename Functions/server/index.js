const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");

const api = express();

api.use(cors());

api.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
api.use(express.json());

const HOST = "localhost";
const PORT = 8888;

// api.get("/blockchain", (req, res) => {
//   console.log("Ping! :D");

//   // Hexadecimal bytecode representation of JSON
//   const hexString = "7b226d657373616765223a2268656c6c6f227d"; // {"message":"hello"}

//   // Set Content-Type to text/plain and send the hex string
//   res.send(hexString);
// });

api.post("/blockchain", (req, res) => {
  console.log("Received API call!");

  const { hash, location, timestamp, imageHash } = req.body;

  console.log("Received Data:");
  console.log(
    JSON.stringify({ hash, location, timestamp, imageHash }, null, 2)
  );

  if (hash) {
    res.setHeader("Content-Type", "application/json"); // Ensure response is JSON
    res.json({
      message: `Hash: ${hash}, posted from: ${location}, posted at: ${timestamp}`,
    });
  } else {
    res.status(400).json({ error: "'hash' not provided in request data" });
  }
});

api.listen(PORT, () => console.log(`API running at ${HOST}:${PORT}!`));
