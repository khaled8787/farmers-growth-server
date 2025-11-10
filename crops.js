import express from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "./verifyToken.js";
import { cropsCollection } from "./dbConnect.js";

const router = express.Router();

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).send({ error: "Unauthorized" });

  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ error: "Forbidden" });
    req.decoded = decoded;
    next();
  });
};

router.get("/my-posts", verifyJWT, async (req, res) => {
  const email = req.decoded.email;
  const crops = await req.app.locals.cropsCollection.find({ "owner.ownerEmail": email }).toArray();
  res.send(crops);
});

router.post("/add", verifyToken, async (req, res) => {
  try {
    const cropData = req.body;
    cropData.owner = {
      ownerEmail: req.user.email,
      ownerName: req.user.name,
    };
    cropData.interests = [];
    const result = await cropsCollection.insertOne(cropData);
    res.send({ success: true, message: "Crop added successfully", result });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

export default router;