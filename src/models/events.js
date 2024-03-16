import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const EventSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  hostId: { type: String, required: true, trim: true },
  locationId: { type: String, required: true, trim: true },
  gameId: { type: String, required: true, trim: true },
  tournamentId: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["DRAFT", "ACTIVE", "IN-PROGRESS", "CANCELLED"],
    default: "DRAFT",
  },
  numOfSets: { type: Number, required: true, trim: true, default: 3 },
  maxPoints: { type: Number, required: true, trim: true, default: 21 },
  venueId: {
    type: [],
    required: true,
  },
  gameType: {
    type: String,
    required: true,
    enum: ["KNOCK_OUT", "ROUND_ROBIN"],
  },
  type: { type: String, required: true, enum: ["SOLO", "DUO"] },
  maxParticipants: { type: Number, required: true },
  minParticipants: { type: Number, required: true },
  gender: { type: String, required: true, enum: ["MALE", "FEMALE", "ALL"] },
  minAge: { type: String, required: true },
  maxAge: { type: String, required: true },
  tournamentFee: { type: Number, required: true },
  fixtureCreated: { type: Boolean, required: true, default: false },
  description: { type: String },
  isActive: { type: Boolean, required: true, default: true },
  startDateAndTime: { type: String, required: true }, // unix timestamp
  dayStartTime: { type: String, required: true }, // eg  "08:00","20:00"
  dayEndTime: { type: String, required: true }, // eg  "08:00","20:00"
  perMatchMaxTime: { type: Number, required: true }, // New in mins eg 10 ,15,20
  perMatchRestTime: { type: Number, required: true }, // New
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const EventModel = mongoose.model("event", EventSchema);

export default EventModel;
