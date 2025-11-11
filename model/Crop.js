import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  quantity: Number,
  description: String,
  image: String,
  owner: {
    ownerName: String,
    ownerEmail: String
  },
  interests: [
    {
      userName: String,
      userEmail: String,
      quantity: Number,
      status: { type: String, default: "pending" }
    }
  ]
}, { timestamps: true });

const Crop = mongoose.model("Crop", cropSchema);
export default Crop;
