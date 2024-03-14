import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const LocationSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  hostId: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  pinCode: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const LocationModel = mongoose.model("location", LocationSchema);

export default LocationModel;
