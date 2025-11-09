import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  cropId: String,
  userEmail: String,
  userName: String,
  quantity: Number,
  message: String,
  status: { type: String, default: "pending" }
}, { timestamps: true });

const ownerSchema = new mongoose.Schema({
  ownerEmail: String,
  ownerName: String
});

const cropSchema = new mongoose.Schema({
  name: String,
  type: String,
  pricePerUnit: Number,
  unit: String,
  quantity: Number,
  description: String,
  location: String,
  image: String,
  interests: [interestSchema],
  owner: ownerSchema
}, { timestamps: true });

export default mongoose.model("Crop", cropSchema);
