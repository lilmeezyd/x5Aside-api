import mongoose from "mongoose";

const teamH2HSchema = new mongoose.Schema({
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

const TeamH2H = mongoose.model("TeamH2H", teamH2HSchema);

export default TeamH2H;