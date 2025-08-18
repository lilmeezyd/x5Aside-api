import mongoose from "mongoose";

const picksSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  eventId: Number,
  picks: []
});
picksSchema.index({ player: 1, eventId: 1 }, { unique: true });
export default picksSchema;