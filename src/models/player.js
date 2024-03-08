import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const PlayerSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  fname: { type: String, required: true },
  lname: { type: String },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
    default: "Male",
  },
  email: { type: String, unique: true },
  phone: { type: String },
  address: { type: Object },
  isVerified: { type: Boolean, required: true, default: false },
  isBlocked: { type: Boolean, required: true, default: false },
  otpSecret: { type: [] },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const PlayerModel = mongoose.model("players", PlayerSchema);

export default PlayerModel;