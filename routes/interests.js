import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("farmerGrowthDB");
const cropsCollection = db.collection("crops");


router.get("/", async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    if (!userEmail) return res.status(400).json({ message: "userEmail query required" });

    const crops = await cropsCollection.find({ "interests.userEmail": userEmail }).toArray();

    const interests = [];
    for (const crop of crops) {
      const matched = (crop.interests || []).filter(i => i.userEmail === userEmail);
      for (const i of matched) {
        interests.push({
          interestId: i._id,
          cropId: crop._id,
          cropName: crop.name,
          ownerName: crop.owner?.ownerName || null,
          quantity: i.quantity || null,
          message: i.message || "",
          status: i.status || "pending",
        });
      }
    }

    res.json(interests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/update", async (req, res) => {
  try {
    const { interestId, cropId, status } = req.body;
    if (!interestId || !cropId || !status) return res.status(400).json({ message: "interestId, cropId and status required" });

    const id = parseInt(cropId);
    const crop = await cropsCollection.findOne({ _id: id });
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const interestEntry = (crop.interests || []).find(i => String(i._id) === String(interestId));
    if (!interestEntry) return res.status(404).json({ message: "Interest not found" });

    if (interestEntry.status && interestEntry.status !== "pending") {
      return res.status(400).json({ message: "Interest already processed" });
    }

    const updateResult = await cropsCollection.updateOne(
      { _id: id, "interests._id": interestEntry._id },
      { $set: { "interests.$.status": status } }
    );

    if (status === "accepted") {
      const qty = Number(interestEntry.quantity) || 0;
      const newQty = Math.max(0, (Number(crop.quantity) || 0) - qty);
      await cropsCollection.updateOne({ _id: id }, { $set: { quantity: newQty } });
    }

    const updatedCrop = await cropsCollection.findOne({ _id: id });
    const updatedInterest = (updatedCrop.interests || []).find(i => String(i._id) === String(interestId));

    res.json({ message: "Interest updated", interest: updatedInterest, cropId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
