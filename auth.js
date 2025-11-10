import express from "express";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/jwt", (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.send({ token });
});

export default router;