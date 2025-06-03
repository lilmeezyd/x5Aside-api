import mongoose from "mongoose";

const teamClassicSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  played: Number,
  wins: Number,
  draws: Number,
  losses: Number,
  goalsFor: Number,
  goalsAgainst: Number,
  points: Number,
  recentResults: [{
    eventId: Number,
    result: { type: String, enum: ["W", "D", "L"] }
  }]
});
export default mongoose.model("TeamClassic", teamClassicSchema);