import mongoose from "mongoose";

const playerEventPointsSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  eventId: Number,
  eventPoints: Number,
  eventTransfersCost: Number,
  totalPoints: Number,
  overallRank: Number
});
playerEventPointsSchema.index({ player: 1, eventId: 1 }, { unique: true });
/*export default mongoose.model("PlayerEventPoints", playerEventPointsSchema);*/
export default playerEventPointsSchema;