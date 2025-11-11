import mongoose from "mongoose";

const CropSchema = new mongoose.Schema({
  _id: Number, 
  name: String,
  type: String,
  pricePerUnit: Number,
  unit: String,
  quantity: Number,
  description: String,
  location: String,
  image: String,
  owner: {
    ownerEmail: String,
    ownerName: String
  },
  interests: Array
});

export default mongoose.model("Crop", CropSchema);
