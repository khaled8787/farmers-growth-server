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
    const crops = await cropsCollection.find().sort({ _id: 1 }).toArray();
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const crop = await cropsCollection.findOne({ _id: id });
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const crop = req.body;
    crop._id = Date.now();
    crop.owner = {
      ownerEmail: crop.ownerEmail || "anonymous@gmail.com",
      ownerName: crop.ownerName || "Anonymous",
    };
    crop.interests = [];
    await cropsCollection.insertOne(crop);
    res.status(201).json({ message: "Crop added successfully", crop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedData = req.body;
    const result = await cropsCollection.updateOne({ _id: id }, { $set: updatedData });
    if (result.matchedCount === 0) return res.status(404).json({ message: "Crop not found" });
    res.json({ message: "Crop updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await cropsCollection.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Crop not found" });
    res.json({ message: "Crop deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/interest", async (req, res) => {
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
    res.status(201).json({ message: "Interest added", interest: newInterest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
