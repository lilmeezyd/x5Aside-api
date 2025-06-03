import mongoose from "mongoose";

const playerEventPointsSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  eventId: Number,
  eventPoints: Number,
  eventTransfersCost: Number
});
export default mongoose.model("PlayerEventPoints", playerEventPointsSchema);