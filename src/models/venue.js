import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const VenueSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  locationId: { type: String, required: true, trim: true },
  hostId: { type: String, required: true },
  details: { type: String, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const VenueModel = mongoose.model("venue", VenueSchema);

export default VenueModel;
