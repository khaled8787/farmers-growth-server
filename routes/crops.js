import express from "express";
import Crop from "../model/Crop.js";
import Interest from "../model/Interest.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const {
      name,
      type,
      pricePerUnit,
      unit,
      quantity,
      description,
      location,
      image,
      ownerEmail,
      ownerName,
    } = req.body;

    if (!name || !type || !pricePerUnit || !unit || !quantity || !location || !ownerEmail) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newCrop = new Crop({
      name,
      type,
      pricePerUnit,
      unit,
      quantity,
      description,
      location,
      image,
      owner: { ownerName, ownerEmail },
    });

    await newCrop.save();
    res.status(201).json(newCrop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const crops = await Crop.find();
    res.json(crops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/myCrops", async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: "userEmail query required" });

    const crops = await Crop.find({ "owner.ownerEmail": userEmail });
    res.json(crops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const interests = await Interest.find({ cropId: crop._id });
    res.json({ ...crop.toObject(), interests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.post("/:id/interest", async (req, res) => {
  try {
    const { userEmail, userName, quantity, message } = req.body;
    const cropId = req.params.id;

    if (!userEmail || !userName || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    if (crop.owner.ownerEmail === userEmail) {
      return res.status(400).json({ message: "Owner cannot show interest in own crop" });
    }

    const existingInterest = await Interest.findOne({ cropId, buyerEmail: userEmail });
    if (existingInterest) {
      return res.status(400).json({ message: "Already showed interest" });
    }

    const newInterest = new Interest({
      cropId,
      cropName: crop.name,
      sellerEmail: crop.owner.ownerEmail,
      buyerEmail: userEmail,
      status: "pending",
      quantity,
      message,
    });

    await newInterest.save();

    res.status(201).json({ interest: newInterest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/interestsByUser", async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: "userEmail query required" });

    const interests = await Interest.find({ buyerEmail: userEmail })
      .populate("cropId", "name type pricePerUnit unit quantity location image owner");

    res.json(interests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.put("/update/:id", async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    if (crop.owner.ownerEmail !== req.body.userEmail)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.delete("/delete/:id", async (req, res) => {
  try {
    const { userEmail } = req.query;
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    if (crop.owner.ownerEmail !== userEmail)
      return res.status(403).json({ message: "Not authorized to delete" });

    await Crop.findByIdAndDelete(req.params.id);
    res.json({ message: "Crop deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
