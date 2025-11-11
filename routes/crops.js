import express from "express";
import Crop from "../models/Crop.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const crops = await Crop.find().sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const newCrop = new Crop(req.body);
    const saved = await newCrop.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("farmerGrowthDB");
const cropsCollection = db.collection("crops");


router.post("/add", verifyToken, async (req, res) => {
  try {
    const crop = req.body;
    crop.owner = { ownerEmail: req.user.email, ownerName: req.user.name };
    crop.interests = [];
    const result = await cropsCollection.insertOne(crop);
    res.status(201).json({ message: "Crop added", crop: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
