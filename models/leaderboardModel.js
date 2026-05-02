import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  goals: Number,
  assists: Number,
  yellows: Number
});
/*export default mongoose.model("Leaderboard", leaderboardSchema);*/

export default leaderboardSchema;
