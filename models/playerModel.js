import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: String,
  xHandle: String,
  fplId: Number,
  position: { type: String, enum: ["Captain", "Ace", "Fwd", "Mid", "Def"] }
});

const Player = mongoose.model("Player", playerSchema);

export default Player;