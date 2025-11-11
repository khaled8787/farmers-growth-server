import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.get("/test", async (req, res) => {
  const all = await cropsCollection.find().toArray();
  res.send(all);
});



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
    console.log(" MongoDB connected successfully!");

 
    const db = client.db("farmerGrowthDB");
    const cropsCollection = db.collection("crops");

 
    app.get("/", (req, res) => {
      res.send(" Farmer Growth Server is running...");
    });

 
    app.get("/crops", async (req, res) => {
      const crops = await cropsCollection.find().toArray();
      res.send(crops);
    });

  } catch (error) {
    console.error(" MongoDB Connection Error:", error);
  }
}
run();


app.listen(port, () => {
  console.log(` Server running on port: ${port}`);
});

import authRouter from './routes/auth.js';

app.use("/auth", authRouter);




