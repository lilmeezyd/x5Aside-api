import mongoose from "mongoose";

const playerTableSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  played: { type: Number, default: 0 },
  win: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  pointsFor: { type: Number, default: 0 },
  pointsAgainst: { type: Number, default: 0 },
  pointsDifference: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  recentResults: [
    {
      eventId: { type: Number, required: true },
      result: { type: String, enum: ["W", "D", "L"], required: true },
      goalsFor: { type: Number, required: true },
      goalsAgainst: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

const PlayerTable = mongoose.model("PlayerTable", playerTableSchema);

export default PlayerTable;