import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cropsRouter from "./crops2.js";
import interestRouter from "./interest.js";
import usersRouter from "./users.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log("MongoDB connected"))
  .catch(err=> console.error("MongoDB connection error:", err));

app.get("/", (req, res) => res.json({ message: "KrishiLink API OK" }));

app.use("/api/crops", cropsRouter);
app.use("/api/interest", interestRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


