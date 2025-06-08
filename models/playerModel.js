import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    xHandle: { type: String, unique: true},
    fplId: { type: Number, unique: true}, 
    position: { type: String, enum: ["Captain", "Ace", "Fwd", "Mid", "Def"] },
    teamName: String,
    manager: String,
    team: { type: mongoose.Schema.Types.Number , ref: "Team" }
  },
  { timestamps: true },
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
