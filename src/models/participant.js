import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const ParticipantSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  hostId: { type: String, required: true },
  tournamentId: { type: String, required: true },
  playerId: { type: String, required: true },
  teamId: { type: String, required: true },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["PENDING", "FAILED", "FAILED"],
  },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ParticipantModel = mongoose.model("participant", ParticipantSchema);

export default ParticipantModel;
