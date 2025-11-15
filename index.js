import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cropsRouter from "./routes/crops.js";
import interestsRouter from "./routes/interests.js";
import authRouter from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/crops", cropsRouter);
app.use("/interests", interestsRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
