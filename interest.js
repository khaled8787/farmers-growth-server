import express from "express";
import Crop from "../models/Crop.js";
import { ObjectId } from "mongodb";

const router = express.Router();


router.post('/', async (req, res) =>{
    try{
        const interest = req.body;
        const interestId = new ObjectId();
        const newInterest = { _id: interestId, ...interest };
        const crop = await Crop.findById(interest.cropId);
        if (!crop) return res.status(404).json({ message: "Crop not found" });

        if (crop.owner?.ownerEmail === interest.userEmail) {
      return res.status(400).json({ message: "Owner cannot send interest" });
    }

    const already = crop.interests.find(i => i.userEmail === interest.userEmail);
    if (already) return res.status(400).json({ message: "Already sent interest" });
     crop.interests.push(newInterest);
    await crop.save();
    res.status(201).json(newInterest);
  } catch (err) { res.status(500).json({ message: err.message }); }
    }
);

router.put('/update', async(req, res) =>{
    try{
        const {interestId, cropsId, status} = req.body;
        const crop = await Crop.findById(cropsId);
        if (!crop) return res.status(404).json({ message: "Crop not found" });

        const interest = crop.interests.id(interestId);
        if (!interest) return res.status(404).json({ message: "Interest not found" });

        if (interest.status !== "pending") return res.status(400).json({ message: "Already processed" });

        interest.status = status;

        if (status === "accepted") {
      crop.quantity = Math.max(0, crop.quantity - interest.quantity);
    }
    await crop.save();
    res.json({ message: "Updated", interest });
  } catch (err) { res.status(500).json({ message: err.message }); };

});

export default router;