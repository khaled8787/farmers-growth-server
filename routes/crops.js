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


router.post("/:id/interest", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { userEmail, userName } = req.body;

    const crop = await cropsCollection.findOne({ _id: id });
    if (!crop) return res.status(404).json({ message: "Crop not found" });

   
    const alreadyInterested = crop.interests?.some(i => i.userEmail === userEmail);
    if (alreadyInterested) {
      return res.status(400).json({ message: "You already showed interest" });
    }

    await cropsCollection.updateOne(
      { _id: id },
      { $push: { interests: { userEmail, userName } } }
    );

    res.json({ message: "Interest added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
