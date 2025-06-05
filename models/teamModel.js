import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  code: Number,
  name: String,
  short_name: String,
  players: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: []}
}, { timestamps: true });
const Team = mongoose.model("Team", teamSchema);

export default Team;
