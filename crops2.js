import express from "express";
import Crop from "crop.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q;
    const limit = parseInt(req.query.limit) || 0;
    let filter = {};
    if (q) filter = { name: { $regex: q, $options: "i" } };
    const crops = await Crop.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json(crops);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json(crop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


router.post("/", async (req, res) => {
  try {
    const newCrop = new Crop(req.body);
    const saved = await newCrop.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;