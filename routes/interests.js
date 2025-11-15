import express from "express";
import Interest from "../model/Interest.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { cropId, cropName, sellerEmail, buyerEmail } = req.body;
    if (!cropId || !sellerEmail || !buyerEmail) return res.status(400).json({ message: "Missing required fields" });

    const exists = await Interest.findOne({ cropId, buyerEmail });
    if (exists) return res.status(400).json({ message: "Already sent interest" });

    const interest = new Interest({ cropId, cropName, sellerEmail, buyerEmail });
    await interest.save();
    res.status(201).json(interest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/myInterests", async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: "userEmail required" });

    const interests = await Interest.find({ buyerEmail: userEmail });
    res.json(interests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { status, userEmail } = req.body;
    const interest = await Interest.findById(req.params.id);

    if (!interest) return res.status(404).json({ message: "Interest not found" });
    if (interest.sellerEmail !== userEmail) return res.status(403).json({ message: "Not authorized to update" });

    interest.status = status;
    await interest.save();
    res.json(interest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { userEmail } = req.query;
    const interest = await Interest.findById(req.params.id);

    if (!interest) return res.status(404).json({ message: "Interest not found" });
    if (interest.buyerEmail !== userEmail && interest.sellerEmail !== userEmail) return res.status(403).json({ message: "Not authorized" });

    await Interest.findByIdAndDelete(req.params.id);
    res.json({ message: "Interest deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/sellerInterests", async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: "userEmail required" });

    const interests = await Interest.find({ sellerEmail: userEmail });

    res.json(interests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
