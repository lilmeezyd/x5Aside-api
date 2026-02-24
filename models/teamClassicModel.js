import mongoose from "mongoose";

const teamClassicSchema = new mongoose.Schema({
  oldRank: { type: Number, default: 0},
  rank: { type: Number, default: 0},
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  played: { type: Number, default: 0 },
  win: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  result: [
  ],
  next: { type: String, default: "None"}
},{timestamps: true});
/*export default mongoose.model("TeamClassic", teamClassicSchema);*/

export default teamClassicSchema;
