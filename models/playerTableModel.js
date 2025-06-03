import mongoose from "mongoose";

const playerTableSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  played: Number,
  wins: Number,
  draws: Number,
  losses: Number,
  points: Number,
});

const PlayerTable = mongoose.model("PlayerTable", playerTableSchema);

export default PlayerTable;