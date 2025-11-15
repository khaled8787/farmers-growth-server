import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String },
  location: { type: String, required: true },
  image: { type: String },
  owner: {
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
  },
});

export default mongoose.model("Crop", cropSchema);
