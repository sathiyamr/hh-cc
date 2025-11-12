import express from "express";
import Moralis from "moralis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

let eventLogs = []; // store captured events here

// Initialize Moralis
await Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

// Example GET route
app.get("/", (req, res) => {
  res.send("Hello from Node.js + Express!");
});

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

// Example POST route
app.post("/api/data", (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

// Function to fetch events from the blockchain using Moralis
async function getContractEvents() {
  try {
    const response = await Moralis.EvmApi.events.getContractLogs({
      chain: "0xaa36a7", // Sepolia
      address: "0x160c795972D1EDee6A6E28D43Ff399b62D739DD7",
      topic0: "ItemListed(address,address,uint256,uint256)", // this replaces `topic`
      fromBlock: "0",
      order: "desc",
      limit: 10,
    });

    console.log("✅ Logs fetched successfully!");
    console.log(response.raw);

    console.log("Response from Moralis:", JSON.stringify(response.raw, null, 2));


    // Extract and push events into our array
    if (response.raw.result && response.raw.result.length > 0) {
      eventLogs = [
        ...eventLogs,
        ...response.raw.result.map((e) => ({
          txHash: e.transaction_hash,
          seller: e.data.seller,
          nftAddress: e.data.nftAddress,
          tokenId: e.data.tokenId,
          price: e.data.price,
        })),
      ];
    }
  } catch (err) {
    console.error("Error fetching contract events:", err);
  }
}

// Call it once on startup
await getContractEvents();

// Optional: poll every 15 seconds
setInterval(getContractEvents, 15000);

// Express route to view captured events
app.get("/events", (req, res) => {
  res.json(eventLogs);
});

app.listen(port, () =>
  console.log(`✅ Server running on http://localhost:${port}`)
);
