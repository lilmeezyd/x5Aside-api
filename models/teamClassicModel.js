import mongoose from "mongoose";

const teamClassicSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  played: { type: Number, default: 0 },
  win: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  recentResults: [
    {
      eventId: { type: Number, required: true },
      result: [],
      nextFixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture" }
    },
  ],
},{timestamps: true});
export default mongoose.model("TeamClassic", teamClassicSchema);
