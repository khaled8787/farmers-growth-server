import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, email, password, photo } = req.body;

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = { name, email, photo, password: hashedPassword };
    await db.collection("users").insertOne(newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password } = req.body;

    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("farmerGrowthDB");
const usersCollection = db.collection("users");


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await usersCollection.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newUser = { name, email, password };
    const result = await usersCollection.insertOne(newUser);
    
    const token = jwt.sign({ email, name }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ message: "User registered", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await usersCollection.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;



