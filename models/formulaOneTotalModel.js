import mongoose from "mongoose";

const formulaOneTotalSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    teamName: { type: String, required: true },
    totalScore: { type: Number, required: true },
    oldRank: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default formulaOneTotalSchema;
