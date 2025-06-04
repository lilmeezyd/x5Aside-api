import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  code: Number,
  name: String,
}, { timestamps: true });
const Team = mongoose.model("Team", teamSchema);

export default Team;
