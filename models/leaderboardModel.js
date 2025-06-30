import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  goals: Number
});
/*export default mongoose.model("Leaderboard", leaderboardSchema);*/

export default leaderboardSchema;
