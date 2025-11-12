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
    console.log(" MongoDB connected successfully!");

    db = client.db("farmerGrowthDB");
    cropsCollection = db.collection("crops");

    app.get("/", (req, res) => {
      res.send(" Farmer Growth Server is running...");
    });

    app.get("/crops", async (req, res) => {
      try {
        const crops = await cropsCollection.find().sort({ _id: 1 }).toArray();
        res.json(crops);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/crops/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const crop = await cropsCollection.findOne({ _id: id });
        if (!crop) return res.status(404).json({ message: "Crop not found" });
        res.json(crop);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/crops/add", async (req, res) => {
      try {
        const crop = req.body;
        crop._id = Date.now(); 
        crop.owner = { ownerEmail: "test@gmail.com", ownerName: "Test Owner" };
        crop.interests = [];
        await cropsCollection.insertOne(crop);
        res.status(201).json({ message: "Crop added successfully", crop });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.put("/crops/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await cropsCollection.updateOne(
          { _id: id },
          { $set: updatedData }
        );
        if (result.matchedCount === 0)
          return res.status(404).json({ message: "Crop not found" });
        res.json({ message: "Crop updated successfully" });
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/crops/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const result = await cropsCollection.deleteOne({ _id: id });
        if (result.deletedCount === 0)
          return res.status(404).json({ message: "Crop not found" });
        res.json({ message: "Crop deleted successfully" });
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/crops/:id/interest", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const { userEmail, userName, quantity, message } = req.body;

        const crop = await cropsCollection.findOne({ _id: id });
        if (!crop) return res.status(404).json({ message: "Crop not found" });

        if (crop.owner?.ownerEmail === userEmail) {
          return res.status(400).json({ message: "Owner cannot send interest to own crop" });
        }

        const already = (crop.interests || []).some(i => i.userEmail === userEmail);
        if (already) return res.status(400).json({ message: "Already sent interest" });

        const interestId = Date.now();
        const newInterest = {
          _id: interestId,
          cropId: id,
          userEmail,
          userName,
          quantity: Number(quantity) || 0,
          message: message || "",
          status: "pending"
        };

        await cropsCollection.updateOne({ _id: id }, { $push: { interests: newInterest } });
        res.status(201).json({ message: "Interest added successfully", interest: newInterest });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(err => console.error(err));

app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
