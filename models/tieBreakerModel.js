import mongoose from "mongoose";

const tieBreakerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  capPoints: { type: Number, default: 0 },
  benchPoints: { type: Number, default: 0 },
  eventId: Number
}, { timestamps: true });

export default tieBreakerSchema;
