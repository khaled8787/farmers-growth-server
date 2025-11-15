import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
  cropName: { type: String },
  sellerEmail: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  status: { type: String, default: "Pending" }, // Pending, Accepted, Rejected
  quantity: { type: Number, required: true },
  message: { type: String },
});

export default mongoose.model("Interest", interestSchema);
