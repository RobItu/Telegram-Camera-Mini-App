// Execute the API request (Promise)
const apiResponse = await Functions.makeHttpRequest({
  url: `https://986244e2c974.ngrok.app/blockchain`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  data: {
    hash: "12345678910abcdefghb8378e9f2ecbe1c9bd5ea7422df372e7b7545f9973c5e5a48b28df4d24af65a7",
    location: "-40.2031, 120.3442",
    timestamp: "01:01:01TMZ0101z",
  },
});

if (apiResponse.error) {
  console.error("API Error:", apiResponse.error);
  throw new Error("Request failed");
}

const { data } = apiResponse;

if (!data) {
  console.error("No data received from the API");
  throw new Error("Empty response data");
}

// Log the response data in a pretty JSON format
console.log("API response data:", JSON.stringify(data, null, 2));

// Return Character Name
return Functions.encodeString(data.message);
