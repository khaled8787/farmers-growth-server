import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db, cropsCollection;

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    db = client.db("farmerGrowthDB");
    cropsCollection = db.collection("crops");

    app.get("/", (req, res) => res.send("Farmer Growth Server is running..."));

    app.get("/crops", async (req, res) => {
      const crops = await cropsCollection.find().sort({ _id: 1 }).toArray();
      res.json(crops);
    });

    app.get("/crops/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const crop = await cropsCollection.findOne({ _id: id });
      if (!crop) return res.status(404).json({ message: "Crop not found" });
      res.json(crop);
    });

    app.post("/crops/add", async (req, res) => {
      const crop = req.body;
      crop._id = Date.now();
      crop.owner = { ownerEmail: "owner@gmail.com", ownerName: "Owner" };
      crop.interests = [];
      await cropsCollection.insertOne(crop);
      res.status(201).json({ message: "Crop added successfully", crop });
    });

    app.post("/crops/:id/interest", async (req, res) => {
      const id = parseInt(req.params.id);
      const { userEmail, userName, quantity, message } = req.body;

      const crop = await cropsCollection.findOne({ _id: id });
      if (!crop) return res.status(404).json({ message: "Crop not found" });

      if (crop.owner?.ownerEmail === userEmail)
        return res.status(400).json({ message: "Owner cannot send interest to own crop" });

      if ((crop.interests || []).some(i => i.userEmail === userEmail))
        return res.status(400).json({ message: "Already sent interest" });

      const newInterest = {
        _id: Date.now(),
        cropId: id,
        userEmail,
        userName,
        quantity: Number(quantity) || 1,
        message: message || "I am interested in this crop",
        status: "pending"
      };

      await cropsCollection.updateOne({ _id: id }, { $push: { interests: newInterest } });
      res.status(201).json({ message: "Interest added successfully", interest: newInterest });
    });

    app.get("/interests", async (req, res) => {
      const userEmail = req.query.userEmail;
      if (!userEmail) return res.status(400).json({ message: "userEmail query required" });

      const crops = await cropsCollection.find({ "interests.userEmail": userEmail }).toArray();
      const interests = [];

      for (const crop of crops) {
        const matched = (crop.interests || []).filter(i => i.userEmail === userEmail);
        matched.forEach(i => {
          interests.push({
            interestId: i._id,
            cropId: crop._id,
            cropName: crop.name,
            ownerName: crop.owner?.ownerName || null,
            quantity: i.quantity,
            message: i.message,
            status: i.status
          });
        });
      }

      res.json(interests);
    });

  } catch (err) {
    console.error(err);
  }
}

run().catch(err => console.error(err));

app.listen(port, () => console.log(`Server running on port ${port}`));
