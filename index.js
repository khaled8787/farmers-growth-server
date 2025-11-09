const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");

    const db = client.db("krishilinkDB");
    const cropsCollection = db.collection("crops");

    app.get("/", (req, res) => {
      res.send("KrishiLink Server is Running...");
    });

    app.get("/test", async (req, res) => {
      const all = await cropsCollection.find().toArray();
      res.send(all);
    });
  } catch (err) {
    console.log(err);
  }
}
run();

app.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
});