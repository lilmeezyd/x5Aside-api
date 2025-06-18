import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    xHandle: { type: String, unique: true},
    fplId: { type: Number, unique: true}, 
    position: { type: String, enum: ["Captain", "Ace", "Forward", "Midfielder", "Defender"] },
    teamName: String,
    manager: String,
    team: { type: mongoose.Schema.Types.ObjectId , ref: "Team" }
  },
  { timestamps: true },
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
