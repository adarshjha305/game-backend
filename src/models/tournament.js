import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";


const TournamentSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  hostId: { type: String, required: true, trim: true },
  gameId: { type: String, required: true, trim: true },
  status: {
    type: String,
    required: true,
    enum: ["DRAFT", "ACTIVE", "IN-PROGRESS", "CANCELLED"],
    default: "DRAFT",
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  /** Sponsors name and logo */
  sponsors: {
    type: [{ name: { type: String }, image: { type: String } }],
    required: true,
  },
  startDateAndTime: { type: String, required: true },
  registrationEndDateTime: { type: String, required: true },
  banner: { type: String, required: true },
  tournamentFee: { type: Number },
  contactPerson: { type: String, required: true },
  contactPhone: { type: String },
  contactEmail: { type: String },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["PENDING", "COMPETED", "FAILED", "REFUNDED"],
    default: "PENDING",
  },	
  paymentAmount: { type: Number },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const TournamentModel = mongoose.model("tournament", TournamentSchema);

export default TournamentModel;





// const TournamentSchema = new mongoose.Schema({
//   _id: { type: String, required: true, trim: true, default: generatePublicId },
//   hostId: { type: String, required: true, trim: true },
//   // locationId: { type: String, required: true, trim: true },
//   gameId: { type: String, required: true, trim: true },
//   status: {
//     type: String,
//     required: true,
//     enum: ["DRAFT", "ACTIVE", "IN-PROGRESS", "CANCELLED"],
//     default: "DRAFT",
//   },
//   // numOfSets: { type: Number, required: true, trim: true, default: 3 },
//   // maxPoints: { type: Number, required: true, trim: true, default: 21 },
//   // venueId: {
//   //   type: [],
//   //   required: true,
//   // },
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   /** Sponsors name and logo */
//   sponsors: {
//     type: [{ name: { type: String }, image: { type: String } }],
//     required: true,
//   },
//   // type: { type: String, required: true, enum: ["SOLO", "DUO"] },
//   startDateAndTime: { type: String, required: true },
//   // endDateAndTime: { type: String, required: true },
//   // maxParticipants: { type: Number, required: true },
//   // minParticipants: { type: Number, required: true },
//   registrationEndDateTime: { type: String, required: true },
//   // gender: { type: String, required: true, enum: ["MALE", "FEMALE", "ALL"] },
//   banner: { type: String, required: true },
//   // minAge: { type: String, required: true },
//   // maxAge: { type: String, required: true },
//   // tournamentFee: { type: Number, required: true },
//   contactPerson: { type: String, required: true },
//   contactPhone: { type: String },
//   contactEmail: { type: String },
//   paymentStatus: {
//     type: String,
//     required: true,
//     enum: ["PENDING", "COMPETED", "FAILED", "REFUNDED"],
//     default: "PENDING",
//   },
//   // fixtureCreated: { type: Boolean, required: true, default: false },
//   paymentAmount: { type: Number },
//   created_by: { type: String },
//   updated_by: { type: String },
//   created_at: { type: String },
//   updated_at: { type: String },
//   isDeleted: { type: Boolean, default: false },
// });

