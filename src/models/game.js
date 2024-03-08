import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const GameSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, required: true, default: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const GameModel = mongoose.model("game", GameSchema);

export default GameModel;
