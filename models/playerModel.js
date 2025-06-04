import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    xHandle: String,
    fplId: Number,
    position: { type: String, enum: ["Captain", "Ace", "Fwd", "Mid", "Def"] },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    points: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
