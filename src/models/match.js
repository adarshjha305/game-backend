import mongoose from "mongoose";
import { string } from "joi";

const ParticipantSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true },
  hostId: { type: String, required: true },
  tournamentId: { type: String, required: true },
  gameId: { type: String, required: true },
  dependentOnMatchResult: { type: String },
  numOfSets: { type: Number, required: true, trim: true, default: 3 },
  maxPoints: { type: Number, required: true, trim: true, default: 21 },
  status: {
    type: String,
    required: true,
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
  },
  score: {
    type: [
      {
        playerId: { type: string },
        score: { type: Number, required: true, default: 0 },
      },
    ],
    required: true,
  },
  matchType: { type: String, required: true, enum: ["SOLO", "DUO"] },
  venueId: { type: String },
  gameType: {
    type: String,
    required: true,
    enum: ["KNOCK_OUT", "ROUND_ROBIN"],
  },
  winner: { type: String, required: true },
  startDateAndTime: { type: String, required: true },
  endDateAndTime: { type: String, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ParticipantModel = mongoose.model("participant", ParticipantSchema);

export default ParticipantModel;
