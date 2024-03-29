import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const HostSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  fname: { type: String, required: true },
  lname: { type: String },
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: { type: String, required: true },
  lastLogin: { type: String },
  termsAndCondition: { type: Boolean, required: true },
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

const HostModel = mongoose.model("host", HostSchema);

export default HostModel;
